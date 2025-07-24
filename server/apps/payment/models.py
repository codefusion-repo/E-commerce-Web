from django.db import models
from apps.purchase.models import Purchase
import uuid
from django.contrib.auth import get_user_model
User = get_user_model()

PAYMENT_METHODS = [
    ("null", "null"),
    ("flow", "flow"),
    ("mercadopago", "mercadopago"),
]

class Payment(models.Model):
    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE)
    id = models.CharField(max_length=100, primary_key=True)
    method = models.CharField(max_length=100, choices=PAYMENT_METHODS, default="null")
    
    media = models.CharField(max_length=100)
    payerEmail = models.CharField(max_length=100)

    currency = models.CharField(max_length=20)

    amount = models.FloatField(default=0)
    fee = models.FloatField(default=0)
    taxes = models.FloatField(default=0)

    received = models.FloatField(default=0)

    creationDate = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user} payment'