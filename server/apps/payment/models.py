from django.db import models
from apps.purchase.models import Purchase
from django.contrib.auth import get_user_model
User = get_user_model()

PAYMENT_METHODS = [
    ("null", "null"),
    ("flow", "flow"),
    ("mercadopago", "mercadopago"),
]

class Payment(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE)
    method = models.CharField(max_length=100, choices=PAYMENT_METHODS, default="null")
    provider_payment_id = models.CharField(max_length=100, blank=True, default="", db_index=True)
    provider_order_id = models.CharField(max_length=100, blank=True, default="", db_index=True)
    status = models.CharField(max_length=50, default="pending")
    
    media = models.CharField(max_length=100)
    payerEmail = models.CharField(max_length=100)

    currency = models.CharField(max_length=20)

    amount = models.FloatField(default=0)
    fee = models.FloatField(default=0)
    taxes = models.FloatField(default=0)

    received = models.FloatField(default=0)

    creationDate = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["purchase", "method"], name="payment_purchase_method_idx"),
        ]

    def __str__(self):
        return f'{self.user} payment'
