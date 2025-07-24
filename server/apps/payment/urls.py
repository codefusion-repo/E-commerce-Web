from django.urls import path
from .views import (
    CreateMercadoPagoPayment, 
    ReceiveMercadoPagoPayment, 
    receiveMercadopagoWebhook,
    CreateFlowPayment,
    ReceiveFlowPayment,
    receiveFlowWebhook,
    receiveFlowRedirect
    )
urlpatterns = [
    path('create/mercadopago', CreateMercadoPagoPayment.as_view()),
    path('receive/mercadopago', ReceiveMercadoPagoPayment.as_view()),
    path('receive/mercadopago/webhook', receiveMercadopagoWebhook),
    path('create/flow', CreateFlowPayment.as_view()),
    path('receive/flow', ReceiveFlowPayment.as_view()),
    path('receive/flow/webhook', receiveFlowWebhook),
    path('receive/flow/redirect', receiveFlowRedirect),
]