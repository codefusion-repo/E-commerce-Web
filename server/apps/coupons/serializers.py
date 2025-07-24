from rest_framework import serializers
from .models import Coupon, UserCoupon

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id',
            "code",
            "discount_percent",
            "discount_value",
            'discount_type'
        ]

class UserCouponSerializer(serializers.ModelSerializer):
    coupon = CouponSerializer()
    class Meta:
        model = UserCoupon
        fields = [
            'id',
            "coupon",
            "isUsed"
        ]