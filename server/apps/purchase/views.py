from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Purchase, PurchaseItem, PurchaseDelivery
from apps.payment.views import create_flow_payment, create_mercadopago_payment
from apps.shop.models import Product
from apps.delivery.models import Address
from apps.coupons.models import Coupon, UserCoupon
from .serializers import PurchaseSerializer
import json
from django.contrib.auth import get_user_model
from django.utils import timezone
import random
import time


User = get_user_model()

def get_payment_error_detail(response):
    if isinstance(response, dict):
        return response.get("detail") or "Payment could not be created"
    return str(response)

def applyCoupon(coupon_code, purchase_id, user_id):
    try:
        if Coupon.objects.filter(code=coupon_code).exists():
            coupon = Coupon.objects.get(code=coupon_code)  
            if coupon.limit <= 0:
                raise ValueError("Coupon not available")
            
            if coupon.discount_expire < timezone.now():
                raise ValueError("Expired coupon")
        else:
            raise ValueError("Coupon not available")
            
        if User.objects.filter(id=user_id).exists():
                user = User.objects.get(id=user_id)  
        else:
            raise ValueError("You must have an account to claim a coupon")
                            
        if UserCoupon.objects.filter(coupon=coupon, user=user).exists():
            userCoupon = UserCoupon.objects.get(coupon=coupon, user=user)

            if userCoupon.status == "is_claimed":
                purchase = Purchase.objects.get(id=purchase_id)

                purchase.coupon = userCoupon
                if userCoupon.coupon.discount_type == "value":
                    discount = userCoupon.coupon.discount_value
                    purchase.total = purchase.total - discount
                elif userCoupon.coupon.discount_type == "percent":
                    discount = round((purchase.subtotal + purchase.deliveryCost) * userCoupon.coupon.discount_percent/100)
                    purchase.total = purchase.total - discount
                elif userCoupon.coupon.discount_type == "free_delivery":
                    discount = purchase.deliveryCost
                    purchase.total = purchase.total - discount

                purchase.discount = discount
                purchase.save()

                userCoupon.status = "is_applied"
                userCoupon.save()

                return "ok", 200
            else:
                if userCoupon.status == "is_applied":
                    raise ValueError("Coupon already applied in other purchase")
                if userCoupon.status == "is_used":
                    raise ValueError("Coupon already used in other purchase")
        else:
            raise ValueError("Coupon not available")
                
    except ValueError as e:
        return e, 500


def get_random_int(min_val: int, max_val: int) -> int:
    return random.randint(min_val, max_val)

# Función para generar un número de orden de compra único
def generar_numero_orden() -> str:
    min_val = 1000
    max_val = 9999

    numero_orden = get_random_int(min_val, max_val)
    timestamp = str(int(time.time() * 1000))  # milisegundos como en JS

    return f"{numero_orden}{timestamp}"

class ResendPurchase(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = (permissions.IsAuthenticated,)
    def post(self, request, format = None):
        try:
            data = self.request.data 
            required_fields = ["commerceOrder", "method"]
            for field in  required_fields:
                if field not in data:
                   raise ValueError(f"Required field: {field}") 
                
            if Purchase.objects.filter(code=data['commerceOrder']).exists():
                purchase = Purchase.objects.get(code=data['commerceOrder'])
            else:
                raise ValueError('Purchase not found')      
                      
            method = data['method']      
            if method == "f":
                res, code = create_flow_payment(purchase.id, request.user)
            elif method == "mp":
                res, code = create_mercadopago_payment(purchase.id, request.user)
            else:
                raise ValueError("Payment method not supported")

            if code == 200:
                return Response(res, status=status.HTTP_200_OK)    
            else:
                raise ValueError(get_payment_error_detail(res))                      
        except ValueError as e:
            print(e)
            return Response({
                'detail': e}, 
                status=status.HTTP_400_BAD_REQUEST)     
          
class CreatePurchase(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = (permissions.IsAuthenticated,)
    def post(self, request, format = None):
        try:
            data = self.request.data 
            required_fields = ["items", "deliveryCost", "serviceDescription", "addressId", "method"]
            for field in  required_fields:
                if field not in data:
                   raise ValueError(f"Required field: {field}")     
                  
            commerceOrder = generar_numero_orden()
            items = json.loads(data['items'])
            deliveryCost = data['deliveryCost']
            serviceDescription = data['serviceDescription']
            addressId = data['addressId']      
            method = data['method']  
            
            if User.objects.filter(id=request.user.id).exists():
                user = User.objects.get(id=request.user.id)
            else:
                raise ValueError("User not found")
            
            subtotal = 0
            for item in items:
                subtotal += item['price'] * item['quantity']

            total = (subtotal + float(deliveryCost))

            Purchase.objects.update_or_create(code=commerceOrder, user=user, defaults={
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
                coupon_res, coupon_code = applyCoupon(data['couponCode'], purchase.id, request.user.id)
                if coupon_code != 200:
                    raise ValueError(coupon_res) 

            if method == "f":
                res, code = create_flow_payment(purchase.id, request.user)
            elif method == "mp":
                res, code = create_mercadopago_payment(purchase.id, request.user)
            else:
                raise ValueError("Payment method not supported")

            if code == 200:
                return Response(res, status=status.HTTP_200_OK)    
            else:
                raise ValueError(get_payment_error_detail(res))                           
        except ValueError as e:
            print(f"error in create: {e}")
            return Response({
                'detail': str(e)}, 
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
        
