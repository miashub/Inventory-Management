# inventory/urls.py

"""
URL Configuration for Inventory API.

Routes:
- /products/             → List all products or add a new one
- /products/<id>/        → Retrieve, update, or delete a specific product
- /products/barcode/<barcode>/ → Lookup product by barcode
- /history/              → Full scan history
- /history/today/        → Today’s scan history
- /logs/                 → Product add/edit action logs
"""

from django.urls import path
from .views import (
    home,
    products,
    product_detail,
    product_by_barcode,
    scan_history,
    scan_today,
    product_logs
)

urlpatterns = [

    path('', home), 

    # Product endpoints
    path('products/', products, name='product-list-create'),
    path('products/<int:pk>/', product_detail, name='product-detail'),
    path('products/barcode/<str:barcode>/', product_by_barcode, name='product-by-barcode'),

    # Scan history endpoints
    path('history/', scan_history, name='scan-history'),
    path('history/today/', scan_today, name='scan-history-today'),

    # Action log endpoint
    path('logs/', product_logs, name='product-logs'),
]
