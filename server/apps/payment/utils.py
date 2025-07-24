from .models import Payment
from apps.myAuth.utils import SendEmail
from django.conf import settings
# Función para crear un pago de una solicitud desde Flow
def createBaseFlowPayment(purchase, response_data):
    try:
        updated, created = Payment.objects.update_or_create(user=purchase.user, purchase=purchase, defaults={
            'id': response_data['flowOrder'],
            'method': 'flow',

            'media': response_data['paymentData']['media'],
            'payerEmail': response_data['payer'],

            'currency': response_data['currency'],

            'amount': float(response_data['amount']),
            'fee': float(response_data['paymentData']['fee']),
            'taxes': float(response_data['paymentData']['taxes']),
            'received': float(response_data['paymentData']['balance']),
        })  
        if created: 
            SendEmail(email=purchase.user.email, name=purchase.user.first_name, templateId=6533966, subject=f"Purchase order: {purchase.code} paid | CodeFusion.cl", variables={ 'name': purchase.user.first_name, 'order_id': purchase.code, 'total_price': purchase.total, 'url': f"https://e-commerce-web.store/profile/purchases/purchase/{purchase.code}" })
        
        return {
            'status': 200
        }
    except Exception as e:
        return {
            'status': 401,
            'detail': e
        }

# Función para crear un pago de una solicitud desde Mercado Pago
def createBaseMercadopagoPayment(purchase, payment, paymentId):
    try:
        updated, created = Payment.objects.update_or_create(user=purchase.user, purchase=purchase, defaults={
            'id': paymentId,
            'method': 'mercadopago',

            'media': "mercadopago",
            'payerEmail': payment['response']['payer']['email'],

            'currency': "CLP",

            'amount': float(payment['response']['metadata']['total_amount']),
            'fee': 0,
            'taxes': 0,
            'received': float(payment['response']['metadata']['total_amount']),
        })  

        if created: 
            SendEmail(email=purchase.user.email, name=purchase.user.first_name, templateId=6533966, subject=f"Purchase order: {purchase.code} paid | CodeFusion.cl", variables={ 'name': purchase.user.first_name, 'order_id': purchase.code, 'total_price': purchase.total, 'url': f"https://e-commerce-web.store/profile/purchases/purchase/{purchase.code}" })
        
        return {
            'status': 200
        }
    except Exception as e:
        return  {
            'status': 401,
            'detail': e
        }