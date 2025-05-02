# inventory/models.py

from django.db import models
from django.utils import timezone


class Product(models.Model):
    """
    Represents an inventory product with unique SKU and barcode and also the expiry date.
    Includes stock quantity and low-stock threshold settings.
    """
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=50, unique=True)
    barcode = models.CharField(max_length=50, unique=True, default="000000")
    quantity = models.PositiveIntegerField()
    expiry_date = models.DateField()
    alert_threshold = models.PositiveIntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ScanHistory(models.Model):
    """
    Stores records of barcode scans (e.g., from scanner page or form modal).
    Not directly tied to a product to allow logging unknown scans.
    """
    barcode = models.CharField(max_length=100)
    source = models.CharField(
        max_length=50,
        default='scanner',
        help_text="Origin of the scan (e.g., 'scanner', 'scan-from-add')"
    )
    scanned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.barcode


class ProductActionLog(models.Model):
    """
    Tracks actions taken on products (Add, Edit, Delete).
    Logs both the action and the product's state at the time.
    """
    ACTION_CHOICES = [
        ('add', 'Add'),
        ('edit', 'Edit'),
        ('delete', 'Delete'),
    ]

    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Reference to the product (nullable for deleted items)"
    )
    product_name = models.CharField(max_length=100)
    product_sku = models.CharField(max_length=50)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    source = models.CharField(max_length=20, default="manual")

    # Change tracking
    quantity_change = models.CharField(max_length=10, blank=True, null=True)
    threshold_change = models.CharField(max_length=10, blank=True, null=True)

    # Current state of product
    current_quantity = models.PositiveIntegerField(null=True, blank=True)
    current_threshold = models.PositiveIntegerField(null=True, blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action.title()} - {self.product_name} ({self.source})"
