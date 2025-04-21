#inventory_project/inventory_project/urls.py

from django.contrib import admin
from django.urls import path
from django.urls import include
from inventory.views import home


urlpatterns = [
    path('', home), 
    path('admin/', admin.site.urls),
    path('api/', include('inventory.urls'))
]
