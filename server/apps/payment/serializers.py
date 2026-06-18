from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'method',
            'provider_payment_id',
            'provider_order_id',
            'status',
            'media',
            'payerEmail',
            'currency',
            'amount',
            'creationDate'
        ] 
