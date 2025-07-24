from rest_framework import serializers
from .models import Address

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id',
            'user',
            'regionName',
            'regionCode',
            'countyName',
            'countyCode',
            'streetName',
            'streetNumber',

            'postalCode',
            'lat',
            'lng',

            'phoneNumber',
            'comment',
            'isDefault'
        ]