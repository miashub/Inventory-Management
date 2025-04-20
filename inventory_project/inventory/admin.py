# inventory/admin.py

from django.contrib import admin
from .models import Product, ScanHistory, ProductActionLog


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Admin interface for Product model.
    Displays stock info and supports searching/filtering.
    """
    list_display = ('name', 'sku', 'barcode', 'quantity', 'alert_threshold', 'created_at')
    search_fields = ('name', 'sku', 'barcode')
    list_filter = ('quantity', 'alert_threshold', 'created_at')
    ordering = ('name',)


@admin.register(ScanHistory)
class ScanHistoryAdmin(admin.ModelAdmin):
    """
    Admin interface for ScanHistory model.
    Useful for tracing barcode scans across the system.
    """
    list_display = ('barcode', 'source', 'scanned_at')
    search_fields = ('barcode', 'source')
    list_filter = ('source', 'scanned_at')
    ordering = ('-scanned_at',)


@admin.register(ProductActionLog)
class ProductActionLogAdmin(admin.ModelAdmin):
    """
    Admin interface for ProductActionLog model.
    Shows historical actions with change details and metadata.
    """
    list_display = (
        'product_name',
        'product_sku',
        'action',
        'source',
        'quantity_change',
        'current_quantity',
        'threshold_change',
        'current_threshold',
        'timestamp'
    )
    search_fields = ('product_name', 'product_sku', 'source', 'action')
    list_filter = ('action', 'source', 'timestamp')
    ordering = ('-timestamp',)
