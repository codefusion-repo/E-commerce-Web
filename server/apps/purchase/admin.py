from django.contrib import admin
from .models import Purchase, PurchaseDelivery, PurchaseItem

admin.site.register(Purchase)
admin.site.register(PurchaseDelivery)
admin.site.register(PurchaseItem)
