from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Purchase, PurchaseItem, PurchaseDelivery
from apps.shop.models import Product
from apps.delivery.models import Address
from apps.coupons.models import Coupon, UserCoupon
from .serializers import PurchaseSerializer
import json
from django.contrib.auth import get_user_model

User = get_user_model()

class CreatePurchase(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = (permissions.IsAuthenticated,)
    def post(self, request, format = None):
        try:
            data = self.request.data 

            if 'commerceOrder' not in data:
                raise ValueError('Order number not received')
            if 'items' not in data:
                raise ValueError('Products not received')
            if 'deliveryCost' not in data:
                raise ValueError('Shipping cost not received')      
            if 'serviceDescription' not in data:
                raise ValueError('Delivery type not received')    
            if 'addressId' not in data:
                raise ValueError('Delivery address not received')   
            if 'discount' not in data:
                discount = 0
            else:
                discount = float(data['discount'])

            commerceOrder = data['commerceOrder']
            items = json.loads(data['items'])
            deliveryCost = data['deliveryCost']
            serviceDescription = data['serviceDescription']
            addressId = data['addressId']      
            
            if User.objects.filter(id=request.user.id).exists():
                user = User.objects.get(id=request.user.id)
            else:
                raise ValueError("User not found")
            
            subtotal = 0
            for item in items:
                subtotal += item['price'] * item['quantity']

            total = (subtotal + float(deliveryCost)) - discount

            Purchase.objects.update_or_create(code=commerceOrder, user=user, defaults={
                'discount': discount,
                'subtotal': subtotal,
                'deliveryCost': float(deliveryCost),
                'total': total,
            })      
            
            if Purchase.objects.filter(code=commerceOrder).exists():
                purchase = Purchase.objects.get(code=commerceOrder)
            else:
                raise ValueError('Purchase not found')

            for item in items:
                product = Product.onSaleObjects.get(id=item['id'])
                PurchaseItem.objects.update_or_create(purchase=purchase, product=product, defaults={
                        'quantity': item['quantity']
                    }) 

            if Address.objects.filter(id=addressId).exists():
                address = Address.objects.get(id=addressId)
            else:
                raise ValueError('Address not found')

            PurchaseDelivery.objects.update_or_create(purchase=purchase, defaults={
                'region': address.regionName,
                'commune': address.countyName,
                'street': address.streetName,
                'streetNumber': address.streetNumber,
                'courierType': serviceDescription
            })    

            if 'couponCode' in data:
                if Coupon.objects.filter(code=data['couponCode']).exists():
                    coupon = Coupon.objects.get(code=data['couponCode'])  
                else:
                    raise ValueError("Coupon not found")
                
                if UserCoupon.objects.filter(coupon=coupon, user=request.user).exists():
                    userCoupon = UserCoupon.objects.get(coupon=coupon, user=request.user)
                    userCoupon.purchase = purchase
                    userCoupon.save()

            return Response({'detail': 'Order created'}, status=status.HTTP_200_OK)                               
        except ValueError as e:
            print(e)
            return Response({
                'detail': e}, 
                status=status.HTTP_400_BAD_REQUEST)

class GetPurchases(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = (permissions.IsAuthenticated,)
    def get(self, request, format = None):
        if Purchase.objects.filter(user=request.user).exists():
            purchases = Purchase.objects.filter(user=request.user).order_by('-creationDate')
            serializer = PurchaseSerializer(purchases, many=True)
            return Response ({'orders': serializer.data}, status=status.HTTP_200_OK) 
        else:
            return Response({'detail': 'No purchase orders found'}, status=status.HTTP_404_NOT_FOUND)
        
class GetPurchase(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = (permissions.IsAuthenticated,)
    def get(self, request, code, format = None):
        if Purchase.objects.filter(code=code).exists():
            purchase = Purchase.objects.get(code=code)
            serializer = PurchaseSerializer(purchase)
            return Response ({'order': serializer.data}, status=status.HTTP_200_OK) 
        else:
            return Response({'detail': 'Purchase order not found'}, status=status.HTTP_404_NOT_FOUND)
        
