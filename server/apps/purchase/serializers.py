from rest_framework import serializers
from .models import Purchase, PurchaseItem, PurchaseDelivery
from apps.payment.models import Payment
from apps.payment.serializers import PaymentSerializer
from apps.shop.serializers import ProductsSerializer
from apps.coupons.models import UserCoupon
from apps.coupons.serializers import UserCouponSerializer

class PurchaseItemSerializer(serializers.ModelSerializer):
    product=ProductsSerializer()
    class Meta:
        model = PurchaseItem
        fields = [
            'id',
            "product",
            "quantity",
        ]

class PurchaseDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseDelivery
        fields = [
            'id',
            "shipmentNumber",
            "region",
            "commune",
            "street",
            "streetNumber",
            "courier",
            "status"
        ]
        
class PurchaseSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    delivery = serializers.SerializerMethodField()
    payment = serializers.SerializerMethodField()
    coupon = serializers.SerializerMethodField()
    class Meta:
        model = Purchase
        fields = [
            "id",
            "code",
            "items",
            "delivery",
            "payment",
            "coupon",
            "discount",
            "subtotal",
            "deliveryCost",
            "total",
            "status",
            "creationDate"
        ]
    def get_payment(self, obj):
        if Payment.objects.filter(purchase=obj).exists():
            payment_qs = Payment.objects.get(purchase=obj)
            payment_qs_serializer = PaymentSerializer(payment_qs)
            return payment_qs_serializer.data 
        else:
            return None
    def get_coupon(self, obj):
        if UserCoupon.objects.filter(purchase=obj).exists():
            coupon_qs = UserCoupon.objects.get(purchase=obj)
            coupon_qs_serializer = UserCouponSerializer(coupon_qs)
            return coupon_qs_serializer.data 
        else:
            return None        
    def get_delivery(self, obj):
        if PurchaseDelivery.objects.filter(purchase=obj).exists():
            delivery_qs = PurchaseDelivery.objects.get(purchase=obj)
            delivery_qs_serializer = PurchaseDeliverySerializer(delivery_qs)
            return delivery_qs_serializer.data    
        else:
            return None

    def get_items(self, obj):
        if PurchaseItem.objects.filter(purchase=obj).exists():
            items_qs = PurchaseItem.objects.filter(purchase=obj)
            items_qs_serializer = PurchaseItemSerializer(items_qs, many=True)
            return items_qs_serializer.data   
        else:
            return []