from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
from .models import Address
from django.contrib.auth import get_user_model
import requests
User = get_user_model()

# Función para obtener los precios de envio desde shipit
class PostShipit(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:


            data = request.data 

            url = "https://api.shipit.cl/v/rates"

            headers = {
                "accept": "application/json",
                "Accept": "application/vnd.shipit.v4",
                "Content-Type": "application/json",
                "X-Shipit-Email": settings.SHIPIT_USER,
                "X-Shipit-Access-Token": settings.SHIPIT_TOKEN,
            }
            origin_id = int(settings.SHIPIT_SENDER_COMMUNE_ID)

            payload = {
                "parcel": {
                    "length": data.get("length"),
                    "height": data.get("height"),
                    "width": data.get("width"),
                    "weight": data.get("weight"),
                    "origin_id": origin_id,
                    "destiny_id": data.get("destiny_id"),
                    "type_of_destiny": "domicilio",
                    "algorithm": 1
                },
            }

            response = requests.post(url, json=payload, headers=headers)
            json_res = response.json()

            prices = json_res.get("prices")
            if not prices: 
                raise ValueError("Couriers not found.")
            return Response(prices, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# Función para agregar una dirección de envio
class AddAddress(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if User.objects.filter(id=request.user.id).exists():
                user = User.objects.get(id=request.user.id)
            else:
                raise ValueError('User not found')
            
            address = Address.objects.create(
                user=user,
                regionName=data['regionName'],
                regionCode=data['regionCode'],
                countyName=data['countyName'],
                countyCode=data['countyCode'],
                streetName=data['streetName'],
                streetNumber=data['streetNumber'],

                postalCode=data['postalCode'],
                lat=data['lat'],
                lng=data['lng'],
                
                phoneNumber=data['phoneNumber'],
                comment=data['comment'],
            )

            if Address.objects.filter(id=address.id).exists():
                address = Address.objects.get(id=address.id)
                if data['isDefault'] == "false":
                    address.isDefault = False
                elif data['isDefault'] == "true":
                    address.isDefault = True
                address.save()
            else:
                raise ValueError('Address not found')
            
            return Response({'detail': 'Added address'}, status=status.HTTP_200_OK)            
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Función para editar una dirección de envio   
class AddressEditor(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            data = self.request.data 
            if Address.objects.filter(id=data['id']).exists():
                address = Address.objects.get(id=data['id'])
            else:
                raise ValueError('Address not found')
            
            if data['isDefault'] == "false":
                isDefault = False
            else:
                isDefault = True     

            address.isDefault = isDefault
            address.regionName=data['regionName']
            address.regionCode=data['regionCode']
            address.countyName=data['countyName']
            address.countyCode=data['countyCode']
            address.streetName=data['streetName']
            address.streetNumber=data['streetNumber']

            address.postalCode=data['postalCode']
            address.lat=data['lat']
            address.lng=data['lng']
                
            address.phoneNumber=data['phoneNumber']
            address.comment=data['comment']
            address.save()    

            return Response({'detail': 'Updated address'}, status=status.HTTP_200_OK) 
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Función para borrar una dirección de envio
class DeleteAddress(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):       
        try:
            data = self.request.data    
            if Address.objects.filter(id=data['id']).exists():
                address = Address.objects.get(id=data['id'])
                address.delete()

                return Response({'detail': 'Address deleted'}, status=status.HTTP_200_OK)
            else:
                raise ValueError('Address not found')               
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Función para cambiar la dirección de envio predeterminada       
class SetDefaultAddress(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):     
        try:
            data = self.request.data 
            if Address.objects.filter(id=data['id']).exists():
                address = Address.objects.get(id=data['id'])
                address.isDefault = True
                address.save()
                return Response({'detail': 'Default address changed'}, status=status.HTTP_200_OK)
            else:
                raise ValueError('Address not found')    
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
