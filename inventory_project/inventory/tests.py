# inventory/tests.py

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Product, ProductActionLog, ScanHistory
from datetime import datetime, timedelta
from django.utils import timezone


class InventoryTests(APITestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name="Widget",
            sku="WID123",
            barcode="999888777666",
            quantity=50,
            alert_threshold=5
        )

    def test_barcode_lookup_returns_similar_if_exact_missing(self):
        similar = Product.objects.create(
            name="Widget Variant",
            sku="WIDVAR",
            barcode="999888000000",
            quantity=20,
            alert_threshold=4
        )
        Product.objects.filter(barcode=self.product.barcode).delete()

        url = reverse('product-by-barcode', args=['999888777666'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('similar', response.data)
        self.assertEqual(response.data['similar'][0]['sku'], similar.sku)

    def test_scan_history_auto_logs_correct_source(self):
        url = reverse('product-by-barcode', args=[self.product.barcode])
        response = self.client.get(url + "?source=scan-from-add")
        self.assertEqual(response.status_code, 200)
        scan = ScanHistory.objects.last()
        self.assertEqual(scan.source, 'scan-from-add')

    def test_edit_with_no_change_logs_zero_diff(self):
        url = reverse('product-detail', args=[self.product.id])
        data = {
            "name": self.product.name,
            "sku": self.product.sku,
            "barcode": self.product.barcode,
            "quantity": self.product.quantity,
            "alert_threshold": self.product.alert_threshold
        }
        response = self.client.put(url + "?source=manual", data, format='json')
        self.assertEqual(response.status_code, 200)

        log = ProductActionLog.objects.last()
        self.assertEqual(log.quantity_change, "0")
        self.assertEqual(log.threshold_change, "0")

    def test_delete_nulls_product_reference_in_log(self):
        url = reverse('product-detail', args=[self.product.id])
        self.client.delete(url)

        log = ProductActionLog.objects.last()
        self.assertIsNone(log.product)  # product is SET_NULL
        self.assertEqual(log.action, 'delete')
        self.assertEqual(log.product_name, "Widget")

    def test_invalid_product_creation_returns_error(self):
        url = reverse('product-list-create')
        bad_data = {
            "name": "",
            "sku": "DUPLICATE",
            "barcode": "",  # Missing barcode
            "quantity": -5,  # Invalid quantity
            "alert_threshold": -1  # Invalid threshold
        }
        response = self.client.post(url, bad_data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('quantity', response.data)
        self.assertIn('name', response.data)

    def test_logs_sorted_descending_by_timestamp(self):
        # Simulate different timestamps
        ProductActionLog.objects.create(
            product=self.product,
            product_name=self.product.name,
            product_sku=self.product.sku,
            action='edit',
            source='manual',
            quantity_change="+1",
            threshold_change="+1",
            current_quantity=51,
            current_threshold=6,
            timestamp=timezone.now() - timedelta(days=1)
        )

        ProductActionLog.objects.create(
            product=self.product,
            product_name=self.product.name,
            product_sku=self.product.sku,
            action='edit',
            source='manual',
            quantity_change="+2",
            threshold_change="+2",
            current_quantity=53,
            current_threshold=8,
            timestamp=timezone.now()
        )

        url = reverse('product-logs')
        response = self.client.get(url)
        timestamps = [entry['timestamp'] for entry in response.data]
        self.assertGreaterEqual(timestamps[0], timestamps[1])  # Latest first

    def test_scan_today_filters_correctly(self):
        # Insert one from yesterday
        ScanHistory.objects.create(
            barcode='000011112222',
            source='scanner',
            scanned_at=timezone.now() - timedelta(days=1)
        )
        # Insert one from today
        ScanHistory.objects.create(
            barcode='000011113333',
            source='scanner',
            scanned_at=timezone.now()
        )

        url = reverse('scan-history-today')
        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['barcode'], '000011113333')
