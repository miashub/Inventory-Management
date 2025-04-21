# inventory/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.utils.timezone import localdate
from .models import Product, ScanHistory, ProductActionLog
from .serializers import ProductSerializer, ScanHistorySerializer
from django.http import JsonResponse



def home(request):
    return JsonResponse({
        "message": "Welcome to the Inventory Management API",
        "endpoints": {
            "products": "/api/products/",
            "scan_history": "/api/history/",
            "product_logs": "/api/logs/",
            "admin": "/admin/"
        },
        "status": "OK"
    })

@csrf_exempt
@api_view(['GET', 'POST'])
def products(request):
    """
    GET: List all products.
    POST: Add a new product (logs 'add' in ProductActionLog).
    """
    if request.method == 'GET':
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            ProductActionLog.objects.create(
                product=product,
                product_name=product.name,
                product_sku=product.sku,
                action='add',
                source=request.GET.get('source', 'manual'),
                quantity_change=f"+{product.quantity}",
                threshold_change=f"+{product.alert_threshold}",
                current_quantity=product.quantity,
                current_threshold=product.alert_threshold
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def product_detail(request, pk):
    """
    GET: Retrieve a product by ID.
    PUT: Update a product (logs changes in ProductActionLog).
    DELETE: Delete a product (logs deletion).
    """
    product = get_object_or_404(Product, pk=pk)

    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    elif request.method == 'PUT':
        old_quantity = product.quantity
        old_threshold = product.alert_threshold

        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            new_quantity = product.quantity
            new_threshold = product.alert_threshold

            quantity_diff = new_quantity - old_quantity
            threshold_diff = new_threshold - old_threshold

            ProductActionLog.objects.create(
                product=product,
                product_name=product.name,
                product_sku=product.sku,
                action='edit',
                source=request.GET.get('source', 'manual'),
                quantity_change=f"{'+' if quantity_diff >= 0 else ''}{quantity_diff}" if quantity_diff != 0 else "0",
                threshold_change=f"{'+' if threshold_diff >= 0 else ''}{threshold_diff}" if threshold_diff != 0 else "0",
                current_quantity=new_quantity,
                current_threshold=new_threshold
            )

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        ProductActionLog.objects.create(
            product=product,
            product_name=product.name,
            product_sku=product.sku,
            action='delete',
            source=request.GET.get('source', 'manual'),
            quantity_change=str(product.quantity),
            threshold_change=str(product.alert_threshold),
            current_quantity=product.quantity,
            current_threshold=product.alert_threshold
        )
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def product_by_barcode(request, barcode):
    """
    GET: Lookup a product by its barcode.
    Logs the scan in ScanHistory.
    Returns exact match if found, and similar barcodes if not.
    """
    source = request.GET.get('source', 'scanner')
    ScanHistory.objects.create(barcode=barcode, source=source)

    exact_product = Product.objects.filter(barcode=barcode).first()
    similar_products = Product.objects.filter(barcode__startswith=barcode[:6])[:5] if not exact_product else []

    response = {}
    if exact_product:
        response['exact'] = ProductSerializer(exact_product).data
    if similar_products:
        response['similar'] = ProductSerializer(similar_products, many=True).data

    if not response:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response(response)



@api_view(['GET'])
def scan_history(request):
    """
    GET: Returns all scan records, including related product info if available.
    """
    history = ScanHistory.objects.all().order_by('-scanned_at')
    data = []

    for entry in history:
        product = Product.objects.filter(barcode=entry.barcode).first()
        data.append({
            'barcode': entry.barcode,
            'scanned_at': entry.scanned_at,
            'product': {
                'name': product.name if product else None,
                'sku': product.sku if product else None,
                'id': product.id if product else None,
            } if product else None
        })

    return Response(data)

@api_view(['GET'])
def scan_today(request):
    today = localdate()
    scans = ScanHistory.objects.filter(scanned_at__date=today).order_by('-scanned_at')
    serializer = ScanHistorySerializer(scans, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def product_logs(request):
    """
    GET: Returns the product action logs (add/edit/delete) from ProductActionLog.
    Each log includes product name, SKU, changes, and timestamp.
    """
    logs = ProductActionLog.objects.order_by('-timestamp')
    data = [
        {
            'product': {
                'name': log.product_name,
                'sku': log.product_sku,
                'id': log.product.id if log.product else None
            },
            'action': log.action,
            'source': log.source,
            'quantity_change': log.quantity_change,
            'threshold_change': log.threshold_change,
            'current_quantity': log.current_quantity,
            'current_threshold': log.current_threshold,
            'timestamp': log.timestamp
        }
        for log in logs
    ]
    return Response(data)
