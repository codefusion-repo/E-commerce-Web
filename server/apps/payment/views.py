from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from apps.purchase.models import Purchase, PurchaseItem
from apps.coupons.models import UserCoupon
from .utils import createBaseFlowPayment, createBaseMercadopagoPayment
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
import mercadopago
import json
import os
import hmac
import hashlib
import requests
from django.shortcuts import redirect

def get_mp_init_point(preference):
    mode = os.environ.get('MERCADO_PAGO_MODE', 'sandbox').lower()
    if mode == 'production':
        return preference.get('init_point') or preference.get('sandbox_init_point')
    return preference.get('sandbox_init_point') or preference.get('init_point')


def get_flow_base_url():
    mode = os.environ.get('FLOW_MODE', 'sandbox').lower()
    if mode == 'production':
        return 'https://flow.cl'
    return 'https://sandbox.flow.cl'


def parse_mp_signature(signature_header):
    signature_data = {}
    for item in signature_header.split(','):
        if '=' not in item:
            continue
        key, value = item.split('=', 1)
        signature_data[key.strip()] = value.strip()
    return signature_data


def build_mp_webhook_manifest(data_id, request_id, timestamp):
    return f"id:{data_id};request-id:{request_id};ts:{timestamp};"


def validate_mp_webhook_signature(request):
    secret = os.environ.get('MERCADO_PAGO_WEBHOOK_SECRET')
    if not secret:
        raise ValueError('Mercado Pago webhook secret not configured')

    signature_header = request.headers.get('x-signature')
    request_id = request.headers.get('x-request-id')
    data_id = request.GET.get('data.id') or request.GET.get('data_id')

    if not signature_header:
        raise ValueError('Mercado Pago webhook signature not received')
    if not request_id:
        raise ValueError('Mercado Pago webhook request id not received')
    if not data_id:
        raise ValueError('Mercado Pago webhook data id not received')

    signature_data = parse_mp_signature(signature_header)
    timestamp = signature_data.get('ts')
    signature = signature_data.get('v1')

    if not timestamp:
        raise ValueError('Mercado Pago webhook timestamp not received')
    if not signature:
        raise ValueError('Mercado Pago webhook signature hash not received')

    manifest = build_mp_webhook_manifest(data_id=data_id, request_id=request_id, timestamp=timestamp)
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        manifest.encode('utf-8'),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, signature):
        raise ValueError('Invalid Mercado Pago webhook signature')

    return True

User = get_user_model()

def create_mercadopago_payment(purchase_id, user):
    try:
        if Purchase.objects.filter(id=purchase_id).exists():
            purchase = Purchase.objects.get(id=purchase_id)

            products = []

            if purchase.coupon:
                discount_item = {
                    "id": "discount",
                    "title": "discount",
                    "description": "",
                    "picture_url": "",
                    "category_id": "",
                    "quantity": 1,
                    "currency_id": "CLP",
                    "unit_price": -purchase.discount,
                }
                products.append(discount_item);
        
            for i in PurchaseItem.objects.filter(purchase=purchase):
                item = {
                  "id": i.product.id,
                  "title": i.product.name,
                  "description": "",
                  "picture_url": str(i.product.thumbnail),
                  "category_id": "",
                  "quantity": i.quantity,
                  "currency_id": "CLP",
                  "unit_price": i.product.price,
                }
                products.append(item)

            preference_data = {
                "purpose": "wallet_purchase",
                "items": products,
                "shipments": {
                    "cost": float(purchase.deliveryCost),
                },
                "payer": {
                    "name": user.first_name,
                    "surname": user.last_name,
                    "email": user.email,
                    "identification": {
                        "type": "DNI",
                        "number": user.rut
                    }
                },
                "back_urls": {
                        "failure": f"{os.environ.get('CLIENT_URL_PRO')}/receive/mercadopago",
                        "pending": f"{os.environ.get('CLIENT_URL_PRO')}/receive/mercadopago",
                        "success": f"{os.environ.get('CLIENT_URL_PRO')}/receive/mercadopago",
                    },
                "auto_return": "approved",

                "metadata": {
                    'commerceOrder': purchase.code,
                    'total_amount': purchase.total,
                },
            }    

            sdk = mercadopago.SDK(os.environ.get("MERCADO_PAGO_ACCESS_TOKEN"))

            preference_response = sdk.preference().create(preference_data)

            preference = preference_response["response"]

            init_point = get_mp_init_point(preference)

            return {'url': init_point}, 200
        else:
            raise ValueError("Unexpected error, please try again")
        
    except ValueError as e:
        return e, 500
    
# Función para enviar un pago a mercado pago
class CreateMercadoPagoPayment(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            sdk = mercadopago.SDK(os.environ.get("MERCADO_PAGO_ACCESS_TOKEN"))
            
            data = self.request.data

            if 'commerceOrder' not in data:
                raise ValueError('Order number not received')
            if 'items' not in data:
                raise ValueError('Products not received')
            if 'deliveryCost' not in data:
                raise ValueError('Shipping cost not received')  
            if 'total_amount' not in data:
                raise ValueError('Total amount not received')  
            
            cost = float(data['deliveryCost'])
            
            items = json.loads(data['items'])

            preference_data = {
                "purpose": "wallet_purchase",
                "items": items,
                "shipments": {
                    "cost": cost,
                },
                "payer": {
                    "name": request.user.first_name,
                    "surname": request.user.last_name,
                    "email": request.user.email,
                    "identification": {
                        "type": "DNI",
                        "number": request.user.rut
                    }
                },
                "back_urls": {
                        "failure": f"{os.environ.get('CLIENT_URL_PRO')}/receive/mercadopago",
                        "pending": f"{os.environ.get('CLIENT_URL_PRO')}/receive/mercadopago",
                        "success": f"{os.environ.get('CLIENT_URL_PRO')}/receive/mercadopago",
                    },
                "auto_return": "approved",

                "metadata": {
                    'commerceOrder': data['commerceOrder'],
                    'total_amount': data['total_amount'],
                },
            }            
            preference_response = sdk.preference().create(preference_data)
            preference = preference_response["response"]

            init_point = get_mp_init_point(preference)

            return Response ({'url': init_point}, status=status.HTTP_200_OK)
        except ValueError as e: 
            return Response({
                'detail': e
            }, status=status.HTTP_400_BAD_REQUEST)

# Función para recibir un pago desde mercado pago
class ReceiveMercadoPagoPayment(APIView):
    #authentication_classes = [JWTAuthentication]
    permission_classes=(permissions.AllowAny,)
    def post(self, request, format=None):
        try:
            # Accept JSON body, form data or query params
            try:
                data = json.loads(request.body) if request.body else request.data
            except Exception:
                data = request.data if request.data else {}

            pref_id = data.get('preference_id') if isinstance(data, dict) else None
            collection_status = data.get('collection_status') if isinstance(data, dict) else None

            # check query params
            if hasattr(request, 'query_params'):
                if not pref_id:
                    pref_id = request.query_params.get('preference_id')
                if not collection_status:
                    collection_status = request.query_params.get('collection_status')

            sdk = mercadopago.SDK(os.environ.get("MERCADO_PAGO_ACCESS_TOKEN"))

            # Browser returns are informational only; state changes happen from the signed webhook.
            if not pref_id and isinstance(data, dict) and data.get('collection_id'):
                payment = sdk.payment().get(data.get('collection_id'))
                pref_id = payment['response'].get('preference_id')
                collection_status = collection_status or payment['response'].get('status')

            if not pref_id:
                raise ValueError("Payment information not received")

            preference = sdk.preference().get(pref_id)

            transaction_status = collection_status or preference['response'].get('status') or preference['response'].get('metadata', {}).get('transaction_status')
            commerceOrder = preference['response'].get('metadata', {}).get('commerceOrder') or preference['response'].get('external_reference')

            if not commerceOrder:
                raise ValueError("Order number not found in preference metadata")

            return Response({
                'detail': 'Payment return received',
                'commerceOrder': commerceOrder,
                'paymentStatus': transaction_status,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)   

# Función para recibir un pago desde un webhook de mercado pago 
@csrf_exempt
def receiveMercadopagoWebhook(request):
    if request.method == 'POST':         
        try: 
            validate_mp_webhook_signature(request)

            try:
                data = json.loads(request.body.decode('utf-8')) if request.body else {}
            except json.JSONDecodeError:
                data = request.POST.dict()

            sdk = mercadopago.SDK(os.environ.get("MERCADO_PAGO_ACCESS_TOKEN"))

            payment_id = data.get('payment_id') or data.get('id') or request.GET.get('id')
            if not payment_id:
                raise ValueError('Mercado Pago payment id not received')

            payment = sdk.payment().get(payment_id)
            
            transaction_status = payment['response'].get('status')
            commerceOrder = payment['response'].get('metadata', {}).get('commerceOrder') or payment['response'].get('metadata', {}).get('commerce_order') or payment['response'].get('external_reference')

            if not commerceOrder:
                raise ValueError("Order number not found in payment metadata")

            if Purchase.objects.filter(code=commerceOrder).exists():
                purchase = Purchase.objects.get(code=commerceOrder)
            else:
                raise ValueError("Order number not found")

            if transaction_status == 'approved':
                purchase.status = 'payed'
                purchase.save()

                res = createBaseMercadopagoPayment(purchase=purchase, payment=payment, paymentId=payment_id)
                if res.get('status') != 200:
                    print(res.get('detail'))
                return Response ({'detail': 'Payment made correctly', 'commerceOrder': commerceOrder}, status=status.HTTP_200_OK)
                
            else:
                purchase.status = 'uncompleted'
                purchase.save()
                return Response ({'detail': 'Something went wrong with the payment', 'commerceOrder': commerceOrder}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_200_OK)

def create_flow_payment(purchase_id, user):
    try:
        if Purchase.objects.filter(id=purchase_id).exists():
            purchase = Purchase.objects.get(id=purchase_id)

            apiKey = os.environ.get('API_KEY_FLOW')
            secretKey = os.environ.get('SECRET_KEY_FLOW')     

            if not apiKey or not secretKey:
                raise ValueError('Flow API keys not configured')

            optional = {}

            for i in PurchaseItem.objects.filter(purchase=purchase):
                optional[i.product.name] = i.quantity 

            print(f"{user.email}: user")

            data = {
                'apiKey': apiKey,
                'commerceOrder': purchase.code,
                'subject': "Order payment",
                'currency': "CLP",
                'amount': purchase.total,
                'email': user.email,
                'paymentMethod': 9, 
                'urlConfirmation': f"{os.environ.get('BACK_URL')}/api/payment/receive/flow/webhook",
                'urlReturn': f"{os.environ.get('BACK_URL')}/api/payment/receive/flow/redirect",
                'optional': json.dumps(optional),
                'timeout': 1800,
            }

            keys = sorted(data.keys())
            stringToSign = ''.join([f'{key}{data[key]}' for key in keys])
            signature = hmac.new(secretKey.encode('utf-8'), stringToSign.encode('utf-8'), hashlib.sha256).hexdigest()
            data['s'] = signature

            url = f"{get_flow_base_url()}/api/payment/create"

            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }

            response = requests.post(url, data=data, headers=headers)

            if response.status_code == 200:
                data = response.json()        
                redirect_url = data['url'] + '?token=' + data['token']
                return {'url': redirect_url}, 200
            else:
                print(f'Request error: {response.status_code} - {response.text}')
                raise ValueError('The request could not be sent')          
        else:
            raise ValueError("Unexpected error, please try again")
        
    except ValueError as e:
        return e, 500
    
# Función para enviar un pago a flow
class CreateFlowPayment(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=(permissions.IsAuthenticated,)
    def post(self, request, format=None):
        try:
            js_params = self.request.data

            apiKey = os.environ.get('API_KEY_FLOW')
            secretKey = os.environ.get('SECRET_KEY_FLOW')

            if not apiKey or not secretKey:
                raise ValueError('Flow API keys not configured')

            data = {
                'apiKey': apiKey,
                'commerceOrder': js_params['commerceOrder'],
                'subject': js_params['subject'],
                'currency': js_params['currency'],
                'amount': js_params['amount'],
                'email': request.user.email,
                'paymentMethod': 9, 
                'urlConfirmation': js_params['urlConfirmation'],
                'urlReturn': js_params['urlReturn'],
                'optional': js_params['optional'],
                'timeout': 1800,
            }

            keys = sorted(data.keys())
            stringToSign = ''.join([f'{key}{data[key]}' for key in keys])
            signature = hmac.new(secretKey.encode('utf-8'), stringToSign.encode('utf-8'), hashlib.sha256).hexdigest()
            data['s'] = signature

            url = f"{get_flow_base_url()}/api/payment/create"

            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }

            response = requests.post(url, data=data, headers=headers)

            if response.status_code == 200:
                data = response.json()
                redirect_url = data['url'] + '?token=' + data['token']
                return Response ({'url': redirect_url}, status=status.HTTP_200_OK)
            else:
                print(f'Request error: {response.status_code} - {response.text}')
                raise ValueError('The request could not be sent')
        except ValueError as e: 
            return Response({
                'detail': e
            }, status=status.HTTP_400_BAD_REQUEST)   

# Función para recibir un pago desde flow
class ReceiveFlowPayment(APIView):
    #authentication_classes = [JWTAuthentication]
    permission_classes=(permissions.AllowAny,)
    def post(self, request, format=None):
        try: 
            data = json.loads(request.body)
            print('data: ', data)

            if "token" not in data:
                return ValueError("Payment failed, please try again")
            
            token = data['token']

            url = f"{get_flow_base_url()}/api/payment/getStatus"
            apiKey = os.environ.get('API_KEY_FLOW')
            secretKey = os.environ.get('SECRET_KEY_FLOW')

            if not apiKey or not secretKey:
                raise ValueError('Flow API keys not configured')
            flow_data = {
                "apiKey": apiKey,
                "token": token
            }
            keys = sorted(flow_data.keys())
            stringToSign = ''.join([f'{key}{flow_data[key]}' for key in keys])
            signature = hmac.new(secretKey.encode('utf-8'), stringToSign.encode('utf-8'), hashlib.sha256).hexdigest()
            flow_data['s'] = signature

            headers = {
                'Accept': 'application/json'
            }

            res = requests.get(url, params=flow_data, headers=headers)
            response_data = res.json()
            
            transaction_status = response_data['status']
            commerceOrder = response_data['commerceOrder']

            return Response({
                'detail': 'Payment return received',
                'commerceOrder': commerceOrder,
                'paymentStatus': transaction_status,
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            print('e: ', e)
            return Response({
                'detail': e
            }, status=status.HTTP_400_BAD_REQUEST)   
        
# Función para recibir un pago desde un webhook de flow
@csrf_exempt
def receiveFlowWebhook(request):
    if request.method == 'POST':         
        try: 
            try:
                data = json.loads(request.body.decode('utf-8')) if request.body else {}
            except json.JSONDecodeError:
                data = request.POST.dict()

            token = data.get('token')
            if not token:
                raise ValueError('Flow token not received')

            url = f"{get_flow_base_url()}/api/payment/getStatus"
            apiKey = os.environ.get('API_KEY_FLOW')
            secretKey = os.environ.get('SECRET_KEY_FLOW')

            if not apiKey or not secretKey:
                raise ValueError('Flow API keys not configured')

            flow_data = {
                "apiKey": apiKey,
                "token": token
            }
            keys = sorted(flow_data.keys())
            stringToSign = ''.join([f'{key}{flow_data[key]}' for key in keys])
            signature = hmac.new(secretKey.encode('utf-8'), stringToSign.encode('utf-8'), hashlib.sha256).hexdigest()
            flow_data['s'] = signature

            headers = {
                'Accept': 'application/json'
            }

            res = requests.get(url, params=flow_data, headers=headers)
            response_data = res.json()
            
            transaction_status = response_data['status']
            commerceOrder = response_data['commerceOrder']

            if Purchase.objects.filter(code=commerceOrder).exists():
                purchase = Purchase.objects.get(code=commerceOrder)
            else:
                raise ValueError("Order number not found")

            if transaction_status == 2:
                purchase.status = 'payed'
                purchase.save()

                res = createBaseFlowPayment(purchase=purchase, response_data=response_data)
                if res['status'] != 200:
                    print(res['detail'])
            else:
                purchase.status = 'uncompleted'
                purchase.save()

            return Response({
                'detail': 'Flow webhook processed',
                'commerceOrder': commerceOrder,
                'paymentStatus': transaction_status,
            }, status=status.HTTP_200_OK)
        except ValueError as e:
            print(e)
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_200_OK)

@csrf_exempt
def receiveFlowRedirect(request):
    if request.method == 'POST':
        token = request.POST.get('token')
        redirect_url = f"{os.environ.get('CLIENT_URL_PRO')}/receive/flow?token={token}"
        return redirect(redirect_url) 