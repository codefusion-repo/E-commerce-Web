from rest_framework import serializers
from .models import IpAddress
from apps.delivery.models import Address
from apps.delivery.serializers import AddressSerializer
from apps.purchase.models import Purchase
from apps.purchase.serializers import PurchaseSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class IpAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = IpAddress
        fields = [
            'ip'
        ]

class UserSerializer(serializers.ModelSerializer):
    addresses = serializers.SerializerMethodField()
    purchases = serializers.SerializerMethodField()
    class Meta: 
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'rut',
            'phone',
            'addresses',
            'purchases'
        ]

    def get_addresses(self, obj):
        if Address.objects.filter(user=obj).exists():
            addresses_qs = Address.objects.filter(user=obj)
            addresses_serializer = AddressSerializer(addresses_qs, many=True)
            return addresses_serializer.data  
        else:
            return [] 
        
    def get_purchases(self, obj):
        if Purchase.objects.filter(user=obj).exists():
            purchases_qs = Purchase.objects.filter(user=obj).order_by("-creationDate")
            purchases_serializer = PurchaseSerializer(purchases_qs, many=True)
            return purchases_serializer.data  
        else:
            return [] 
                
class TokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    access = serializers.CharField()

class StatusSerializer(serializers.Serializer):
    uid = serializers.CharField()
    status = serializers.CharField()

