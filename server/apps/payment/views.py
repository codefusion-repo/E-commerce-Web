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

            return {'url': preference['sandbox_init_point']}, 200
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

            return Response ({'url': preference['sandbox_init_point']}, status=status.HTTP_200_OK)
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
            data = json.loads(request.body)

            if "preference_id" not in data:
                return ValueError("Payment failed, please try again")
            
            if "collection_status" not in data:
                return ValueError("Payment failed, please try again")

            sdk = mercadopago.SDK(os.environ.get("MERCADO_PAGO_ACCESS_TOKEN"))

            preference = sdk.preference().get(data['preference_id'])

            transaction_status = data['collection_status']
            commerceOrder = preference['response']['metadata']['commerceOrder']

            if preference['response']['expires'] == True:
                if preference['response']['metadata']['transaction_status'] == "approved":
                    detail = 'Payment made correctly'
                else:
                    detail = 'Payment failed, please try again'
                return Response ({'detail': detail, 'commerceOrder': commerceOrder}, status=status.HTTP_200_OK)

            request = {
                "metadata": {
                    'transaction_status': transaction_status
                },
                "expires": True,
            }

            sdk.preference().update(data['preference_id'], request)

            if Purchase.objects.filter(code=commerceOrder).exists():
                purchase = Purchase.objects.get(code=commerceOrder)
            else:
                raise ValueError("Order number not found")

            if transaction_status == 'approved':
                purchase.status = 'payed'
                purchase.save()

                res = createBaseMercadopagoPayment(purchase=purchase, payment=preference, paymentId=data['preference_id'])
                if res['status'] != 200:
                    print(res['detail'])

                return Response ({'detail': 'Payment made correctly', 'commerceOrder': commerceOrder}, status=status.HTTP_200_OK)
                
            else:
                purchase.status = 'uncompleted'
                purchase.save()
                return Response ({'detail': 'Something went wrong with the payment, try again', 'commerceOrder': commerceOrder}, status=status.HTTP_400_BAD_REQUEST)            

        except ValueError as e:
            return Response({
                'detail': e
            }, status=status.HTTP_400_BAD_REQUEST)   

# Función para recibir un pago desde un webhook de mercado pago 
@csrf_exempt
def receiveMercadopagoWebhook(request):
    if request.method == 'POST':         
        try: 
            data = request.data 
            sdk = mercadopago.SDK(os.environ.get("MERCADO_PAGO_ACCESS_TOKEN"))

            payment = sdk.payment().get(data['payment_id'])
            
            transaction_status = payment['response']['status']
            commerceOrder = payment['response']['metadata']['commerce_order']

            if Purchase.objects.filter(code=commerceOrder).exists():
                purchase = Purchase.objects.get(code=commerceOrder)
            else:
                raise ValueError("Order number not found")

            if transaction_status == 'approved':
                purchase.status = 'payed'
                purchase.save()

                res = createBaseMercadopagoPayment(purchase=purchase, payment=payment, paymentId=data['payment_id'])
                if res['status'] != 200:
                    print(res['detail'])
                return Response ({'detail': 'Payment made correctly', 'commerceOrder': commerceOrder}, status=status.HTTP_200_OK)
                
            else:
                purchase.status = 'uncompleted'
                purchase.save()
                return Response ({'detail': 'Something went wrong with the payment', 'commerceOrder': commerceOrder}, status=status.HTTP_400_BAD_REQUEST)            

        except ValueError as e:
            return Response({
                'detail': e
            }, status=status.HTTP_400_BAD_REQUEST)          

def create_flow_payment(purchase_id, user):
    try:
        if Purchase.objects.filter(id=purchase_id).exists():
            purchase = Purchase.objects.get(id=purchase_id)

            apiKey = os.environ.get('API_KEY_FLOW')
            secretKey = os.environ.get('SECRET_KEY_FLOW')     

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
                'urlConfirmation': f"{os.environ.get('BACK_URL')}/api/payment/receive/flow/webwook",
                'urlReturn': f"{os.environ.get('BACK_URL')}/api/payment/receive/flow/redirect",
                'optional': json.dumps(optional),
                'timeout': 1800,
            }

            keys = sorted(data.keys())
            stringToSign = ''.join([f'{key}{data[key]}' for key in keys])
            signature = hmac.new(secretKey.encode('utf-8'), stringToSign.encode('utf-8'), hashlib.sha256).hexdigest()
            data['s'] = signature

            url = 'https://sandbox.flow.cl/api/payment/create'

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

            url = 'https://sandbox.flow.cl/api/payment/create'

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

            url = 'https://sandbox.flow.cl/api/payment/getStatus'
            apiKey = os.environ.get('API_KEY_FLOW')
            secretKey = os.environ.get('SECRET_KEY_FLOW')
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
                return Response ({'detail': 'Payment made correctly', 'commerceOrder': commerceOrder}, status=status.HTTP_200_OK)
            else:
                purchase.status = 'uncompleted'
                purchase.save()

                return Response ({'detail': 'Payment failed, please try again', 'commerceOrder': commerceOrder}, status=status.HTTP_200_OK)            

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
            data = request.data 
            token = data['token']
            url = 'https://sandbox.flow.cl/api/payment/getStatus'
            apiKey = os.environ.get('API_KEY_FLOW')
            secretKey = os.environ.get('SECRET_KEY_FLOW')
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
                # return Response ({'detail': 'Pago realizado correctamente', 'commerceOrder': commerceOrder}, status=status.HTTP_200_OK)
                
            else:
                purchase.status = 'uncompleted'
                purchase.save()
                # return Response ({'detail': 'Error con el pago, por favor intentalo nuevamente', 'commerceOrder': commerceOrder}, status=status.HTTP_200_OK)            
        except ValueError as e:
            print(e)
            # return Response({
            #   'detail': e
            # }, status=status.HTTP_400_BAD_REQUEST)    
    return Response(status=status.HTTP_200_OK)

@csrf_exempt
def receiveFlowRedirect(request):
    if request.method == 'POST':
        token = request.POST.get('token')
        redirect_url = f"{os.environ.get('CLIENT_URL_PRO')}/receive/flow?token={token}"
        return redirect(redirect_url) 