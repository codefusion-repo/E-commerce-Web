from django.db import models
import uuid
from apps.purchase.models import Purchase
from django.contrib.auth import get_user_model

User = get_user_model()

options_type = {
    ('percent', 'percent'),
    ('value', 'value'),
}

class Coupon(models.Model):
    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False) 
    
    code = models.CharField(max_length=155, unique=True)
    discount_percent = models.FloatField(blank=True, null=True)
    discount_value = models.FloatField(blank=True, null=True)

    discount_type = models.CharField(max_length=155, choices=options_type, default='value')

    limit = models.IntegerField(default=150)

    discount_expire = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f'Coupon: {self.code}, Discount_type: {self.discount_type}, Valor: {self.discount_percent}/{self.discount_value}'
    
class UserCoupon(models.Model):
    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, blank=True, null=True)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    isUsed = models.BooleanField(default=False)
    
    def __str__(self):
        return f'Coupon: {self.coupon.code}, isUsed: {self.isUsed}, User: {self.user.email}'