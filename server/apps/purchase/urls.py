from django.urls import path
from .views import CreatePurchase, GetPurchase, GetPurchases, ResendPurchase

urlpatterns = [
path('create', CreatePurchase.as_view()),
path('resend', ResendPurchase.as_view()),
path('get/purchases', GetPurchases.as_view()),
path('get/<code>', GetPurchase.as_view()),
]