from django.urls import path
from .views import CreatePurchase, GetPurchase, GetPurchases

urlpatterns = [
path('create', CreatePurchase.as_view()),
path('get/purchases', GetPurchases.as_view()),
path('get/<code>', GetPurchase.as_view()),
]