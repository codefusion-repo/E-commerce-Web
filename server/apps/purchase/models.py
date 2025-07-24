from django.db import models
from apps.shop.models import Product
from django.contrib.auth import get_user_model
import uuid
User = get_user_model()

PURCHASE_STATUS = {
    ("created", "creada"),
    ("uncompleted", "incompleta"),
    ("payed", "pagada"),
    ("delivered", "entregada"),
}

class Purchase(models.Model):
    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    code            = models.CharField(max_length=150)
    user            = models.ForeignKey(User, on_delete=models.CASCADE)
    discount        = models.IntegerField(default=0)
    subtotal        = models.IntegerField(default=0)
    deliveryCost    = models.IntegerField(default=0)
    total           = models.IntegerField(default=0)
    bnbTotal        = models.FloatField(blank=True, null=True)
    creationDate = models.DateTimeField(auto_now_add=True)

    status          = models.CharField(max_length=100, choices=PURCHASE_STATUS, default="created")

    def __str__(self):
        return f'{self.user.email}: ${self.total}'
    
class PurchaseDelivery(models.Model):
    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    purchase        = models.ForeignKey(Purchase, on_delete=models.CASCADE)
    shipmentNumber  = models.IntegerField(default=0, null=True, blank=True)
    region          = models.CharField(max_length=255)
    commune         = models.CharField(max_length=255)
    street          = models.CharField(max_length=255)
    streetNumber    = models.CharField(max_length=255)
    courier         = models.CharField(max_length=100, default="CHILEXPRESS")
    courierType     = models.CharField(max_length=100)
    SHIPPING_STATUS = [
        ("created", "creada"),
        ("receivedForCourier", "recibidaPorCourier"),
        ("inRoute", "enRuta"),
        ("delivered", "Entregado"),
    ]
    status          = models.CharField(max_length=100, choices=SHIPPING_STATUS, default="created")

    def __str__(self):
        return f'Purchase: {self.purchase.code}'

    
class PurchaseItem(models.Model):
    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE)
    product  = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)

    def __str__(self):
        return f'Purchase: {self.purchase.code}, Item: {self.product}'
