from django.db import models
import uuid
from django.contrib.auth import get_user_model

User = get_user_model()

options_type = {
    ('percent', 'percent'),
    ('value', 'value'),
    ('free_delivery', 'free_delivery')
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
        return f'Coupon: {self.code}, Discount_type: {self.discount_type}'
    
class UserCoupon(models.Model):
    id      = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    user    = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_coupons")
    coupon  = models.ForeignKey(Coupon, on_delete=models.CASCADE)

    COUPON_STATUS = {
        ("is_used", "Used"),
        ("is_applied", "Applied"),
        ("is_claimed", "Claimed"),
        ("is_expired", "Expired"),
    }
    status = models.CharField(choices=COUPON_STATUS, default="is_claimed", max_length=30)

    creationDate = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'Coupon: {self.coupon.code}, status: {self.status}'