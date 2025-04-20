# inventory/serializers.py

from rest_framework import serializers
from .models import Product, ScanHistory


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for the Product model.
    Serializes all product fields for CRUD operations.
    """
    class Meta:
        model = Product
        fields = '__all__'


class ScanHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for ScanHistory.
    Includes related product info via a custom `product` field.
    """
    product = serializers.SerializerMethodField()

    class Meta:
        model = ScanHistory
        fields = ['barcode', 'scanned_at', 'product']

    def get_product(self, obj):
        """
        Return basic product details linked to the scanned barcode.
        If the barcode doesn't match any product, returns 'Unknown'.
        """
        product = Product.objects.filter(barcode=obj.barcode).only('name', 'sku').first()
        return {
            'name': product.name if product else 'Unknown',
            'sku': product.sku if product else 'Unknown',
        }
