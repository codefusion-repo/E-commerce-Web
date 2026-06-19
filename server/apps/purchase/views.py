from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Purchase, PurchaseItem, PurchaseDelivery
from apps.payment.views import create_flow_payment, create_mercadopago_payment
from apps.shop.models import Product, ProductDimensions
from apps.delivery.models import Address
from apps.coupons.models import Coupon, UserCoupon
from .serializers import PurchaseSerializer
import json
from django.contrib.auth import get_user_model
from django.conf import settings
from django.db import transaction
from django.utils import timezone
import random
import requests
import time


User = get_user_model()

def get_payment_error_detail(response):
    if isinstance(response, dict):
        return response.get("detail") or "Payment could not be created"
    return str(response)


def parse_delivery_cost(value):
    try:
        delivery_cost = int(round(float(value)))
    except (TypeError, ValueError):
        raise ValueError("Invalid delivery cost")

    if delivery_cost < 0:
        raise ValueError("Invalid delivery cost")

    return delivery_cost


def parse_requested_items(raw_items):
    try:
        items = json.loads(raw_items) if isinstance(raw_items, str) else raw_items
    except json.JSONDecodeError:
        raise ValueError("Invalid shopping cart")

    if not isinstance(items, list) or len(items) == 0:
        raise ValueError("No products in your shopping cart")

    requested_items = {}
    for item in items:
        product_id = item.get("id") if isinstance(item, dict) else None
        if not product_id:
            raise ValueError("Invalid product in shopping cart")

        try:
            quantity = int(item.get("quantity", 0))
        except (TypeError, ValueError):
            raise ValueError("Invalid product quantity")

        if quantity <= 0:
            raise ValueError("Invalid product quantity")

        requested_items[str(product_id)] = requested_items.get(str(product_id), 0) + quantity

    return requested_items


def get_purchase_items_and_subtotal(raw_items):
    requested_items = parse_requested_items(raw_items)
    products = Product.onSaleObjects.filter(id__in=requested_items.keys())
    product_by_id = {str(product.id): product for product in products}

    if len(product_by_id) != len(requested_items):
        raise ValueError("One or more products are not available")

    purchase_items = []
    subtotal = 0
    for product_id, quantity in requested_items.items():
        product = product_by_id[product_id]
        if quantity > product.stock:
            raise ValueError(f"Insufficient stock for {product.name}")

        subtotal += int(product.price) * quantity
        purchase_items.append((product, quantity))

    return purchase_items, subtotal


def get_package_dimensions(purchase_items):
    weight = 0
    height = 1
    length = 1
    width = 1

    for product, quantity in purchase_items:
        dimensions = ProductDimensions.objects.filter(product=product).first()
        if not dimensions:
            weight += 0.01 * quantity
            continue

        weight += float(dimensions.weight) * quantity
        height = max(height, float(dimensions.height))
        length = max(length, float(dimensions.length))
        width = max(width, float(dimensions.width))

    return {
        "weight": weight,
        "height": height,
        "length": length,
        "width": width,
    }


def get_verified_delivery_cost(address, service_description, purchase_items):
    if not service_description:
        raise ValueError("Delivery method not selected")

    package = get_package_dimensions(purchase_items)
    payload = {
        "parcel": {
            "length": package["length"],
            "height": package["height"],
            "width": package["width"],
            "weight": package["weight"],
            "origin_id": int(settings.SHIPIT_SENDER_COMMUNE_ID),
            "destiny_id": int(address.countyCode),
            "type_of_destiny": "domicilio",
            "algorithm": 1,
        },
    }
    headers = {
        "accept": "application/json",
        "Accept": "application/vnd.shipit.v4",
        "Content-Type": "application/json",
        "X-Shipit-Email": settings.SHIPIT_USER,
        "X-Shipit-Access-Token": settings.SHIPIT_TOKEN,
    }

    try:
        response = requests.post(
            "https://api.shipit.cl/v/rates",
            json=payload,
            headers=headers,
            timeout=15,
        )
        prices = response.json().get("prices") or []
    except (requests.RequestException, ValueError):
        raise ValueError("Delivery cost could not be verified")

    selected_courier = str(service_description).strip().lower()
    for option in prices:
        courier = str(option.get("original_courier", "")).strip().lower()
        if courier == selected_courier:
            return parse_delivery_cost(option.get("price"))

    raise ValueError("Delivery method not available")


def calculate_coupon_discount(user_coupon, subtotal, delivery_cost):
    coupon = user_coupon.coupon
    base_total = subtotal + delivery_cost
    discount = 0

    if coupon.discount_type == "value":
        discount = int(round(coupon.discount_value or 0))
    elif coupon.discount_type == "percent":
        discount = round(base_total * (coupon.discount_percent or 0) / 100)
    elif coupon.discount_type == "free_delivery":
        discount = delivery_cost

    return max(0, min(int(discount), base_total))


def detach_coupon_from_unpaid_purchase(user_coupon, current_purchase):
    try:
        linked_purchase = user_coupon.coupon_applied
    except Purchase.DoesNotExist:
        linked_purchase = None

    if not linked_purchase or linked_purchase.id == current_purchase.id:
        return

    if linked_purchase.status == "payed":
        raise ValueError("Coupon already used in other purchase")

    linked_purchase.coupon = None
    linked_purchase.discount = 0
    linked_purchase.total = linked_purchase.subtotal + linked_purchase.deliveryCost
    linked_purchase.save(update_fields=["coupon", "discount", "total"])


def applyCoupon(coupon_code, purchase_id, user_id):
    try:
        if Coupon.objects.filter(code=coupon_code).exists():
            coupon = Coupon.objects.get(code=coupon_code)  
            if coupon.limit <= 0:
                raise ValueError("Coupon not available")
            
            if coupon.discount_expire and coupon.discount_expire < timezone.now():
                raise ValueError("Expired coupon")
        else:
            raise ValueError("Coupon not available")
            
        if User.objects.filter(id=user_id).exists():
                user = User.objects.get(id=user_id)  
        else:
            raise ValueError("You must have an account to claim a coupon")
                            
        if UserCoupon.objects.filter(coupon=coupon, user=user).exists():
            userCoupon = UserCoupon.objects.get(coupon=coupon, user=user)

            if userCoupon.status == "is_used":
                raise ValueError("Coupon already used in other purchase")
            if userCoupon.status not in ["is_claimed", "is_applied"]:
                raise ValueError("Coupon not available")

            purchase = Purchase.objects.get(id=purchase_id)
            detach_coupon_from_unpaid_purchase(userCoupon, purchase)

            discount = calculate_coupon_discount(
                user_coupon=userCoupon,
                subtotal=purchase.subtotal,
                delivery_cost=purchase.deliveryCost,
            )
            purchase.coupon = userCoupon
            purchase.discount = discount
            purchase.total = purchase.subtotal + purchase.deliveryCost - discount
            purchase.save(update_fields=["coupon", "discount", "total"])

            if userCoupon.status == "is_applied":
                userCoupon.status = "is_claimed"
                userCoupon.save(update_fields=["status"])

            return "ok", 200
        else:
            raise ValueError("Coupon not available")
                
    except ValueError as e:
        return str(e), 400


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
                
            if Purchase.objects.filter(code=data['commerceOrder'], user=request.user).exists():
                purchase = Purchase.objects.get(code=data['commerceOrder'], user=request.user)
            else:
                raise ValueError('Purchase not found')

            if purchase.status == "payed":
                raise ValueError("Purchase already paid")
                      
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
            return Response({
                'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST)     
          
class CreatePurchase(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = (permissions.IsAuthenticated,)
    def post(self, request, format = None):
        try:
            data = self.request.data 
            required_fields = ["items", "serviceDescription", "addressId", "method"]
            for field in  required_fields:
                if field not in data:
                   raise ValueError(f"Required field: {field}")     
                  
            commerceOrder = generar_numero_orden()
            purchase_items, subtotal = get_purchase_items_and_subtotal(data['items'])
            serviceDescription = data['serviceDescription']
            addressId = data['addressId']      
            method = data['method']  
            
            if User.objects.filter(id=request.user.id).exists():
                user = User.objects.get(id=request.user.id)
            else:
                raise ValueError("User not found")

            if Address.objects.filter(id=addressId, user=request.user).exists():
                address = Address.objects.get(id=addressId, user=request.user)
            else:
                raise ValueError('Address not found')

            deliveryCost = get_verified_delivery_cost(
                address=address,
                service_description=serviceDescription,
                purchase_items=purchase_items,
            )
            total = subtotal + deliveryCost

            with transaction.atomic():
                Purchase.objects.update_or_create(code=commerceOrder, user=user, defaults={
                    'subtotal': subtotal,
                    'deliveryCost': deliveryCost,
                    'total': total,
                })

                if Purchase.objects.filter(code=commerceOrder, user=user).exists():
                    purchase = Purchase.objects.get(code=commerceOrder, user=user)
                else:
                    raise ValueError('Purchase not found')

                PurchaseItem.objects.filter(purchase=purchase).delete()
                for product, quantity in purchase_items:
                    PurchaseItem.objects.create(
                        purchase=purchase,
                        product=product,
                        quantity=quantity,
                    )

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
        
