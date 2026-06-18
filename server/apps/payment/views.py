from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from apps.purchase.models import Purchase, PurchaseItem

from .utils import createBaseFlowPayment, createBaseMercadopagoPayment

import hashlib
import hmac
import json
import os

import mercadopago
import requests


MERCADO_PAGO_FAILED_STATUSES = {
    "cancelled",
    "charged_back",
    "refunded",
    "rejected",
}


def get_public_url(name):
    return os.environ.get(name, "").rstrip("/")


def get_client_url():
    if os.environ.get("MERCADO_PAGO_MODE", "sandbox").lower() == "production":
        return get_public_url("CLIENT_URL_PRO")
    return get_public_url("CLIENT_URL_SANDBOX") or get_public_url("CLIENT_URL_PRO")


def get_flow_client_url():
    if os.environ.get("FLOW_MODE", "sandbox").lower() == "production":
        return get_public_url("CLIENT_URL_PRO")
    return get_public_url("CLIENT_URL_SANDBOX") or get_public_url("CLIENT_URL_PRO")


def get_back_url():
    return get_public_url("BACK_URL")


def get_flow_api_url(endpoint):
    if os.environ.get("FLOW_MODE", "sandbox").lower() == "production":
        base_url = "https://www.flow.cl/api"
    else:
        base_url = "https://sandbox.flow.cl/api"
    return f"{base_url}/{endpoint.lstrip('/')}"


def get_mp_init_point(preference):
    if os.environ.get("MERCADO_PAGO_MODE", "sandbox").lower() == "production":
        return preference.get("init_point") or preference.get("sandbox_init_point")
    return preference.get("sandbox_init_point") or preference.get("init_point")


def parse_request_data(request):
    if hasattr(request, "data"):
        data = request.data
        if hasattr(data, "dict"):
            return data.dict()
        return dict(data)

    if request.body:
        try:
            return json.loads(request.body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            pass

    if request.POST:
        return request.POST.dict()

    return {}


def get_query_param(request, name):
    query_params = getattr(request, "query_params", None)
    if query_params is not None:
        return query_params.get(name)
    return request.GET.get(name)


def sign_flow_params(params, secret_key):
    keys = sorted(key for key in params.keys() if key != "s")
    string_to_sign = "".join([f"{key}{params[key]}" for key in keys])
    return hmac.new(
        secret_key.encode("utf-8"),
        string_to_sign.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def call_flow_api(method, endpoint, params):
    secret_key = os.environ.get("SECRET_KEY_FLOW")
    signed_params = params.copy()
    signed_params["s"] = sign_flow_params(signed_params, secret_key)
    url = get_flow_api_url(endpoint)

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    if method == "post":
        response = requests.post(url, data=signed_params, headers=headers, timeout=15)
    else:
        response = requests.get(url, params=signed_params, headers=headers, timeout=15)

    if response.status_code != 200:
        try:
            response_data = response.json()
            detail = response_data.get("message") or response_data.get("error")
        except ValueError:
            detail = response.text
        raise ValueError(detail or "The request could not be sent")

    return response.json()


def get_flow_status(token):
    return call_flow_api(
        "get",
        "payment/getStatus",
        {
            "apiKey": os.environ.get("API_KEY_FLOW"),
            "token": token,
        },
    )


def update_purchase_from_flow_status(response_data):
    transaction_status = int(response_data["status"])
    commerce_order = response_data["commerceOrder"]
    purchase = Purchase.objects.get(code=commerce_order)

    if transaction_status == 2:
        purchase.status = "payed"
        purchase.save(update_fields=["status"])

        payment_result = createBaseFlowPayment(
            purchase=purchase,
            response_data=response_data,
        )
        if payment_result.get("status") != 200:
            print(payment_result.get("detail"))

        return {
            "detail": "Payment made correctly",
            "commerceOrder": commerce_order,
            "paymentStatus": transaction_status,
        }

    purchase.status = "uncompleted"
    purchase.save(update_fields=["status"])
    return {
        "detail": "Payment failed, please try again",
        "commerceOrder": commerce_order,
        "paymentStatus": transaction_status,
    }


def extract_mp_payment_id(request, data):
    payment_id = (
        data.get("payment_id")
        or data.get("id")
        or get_query_param(request, "payment_id")
        or get_query_param(request, "id")
        or get_query_param(request, "data.id")
    )
    if payment_id:
        return str(payment_id)

    nested_data = data.get("data")
    if isinstance(nested_data, dict) and nested_data.get("id"):
        return str(nested_data["id"])

    return None


def get_mp_commerce_order(payment):
    metadata = payment.get("metadata") or {}
    return (
        metadata.get("commerce_order")
        or metadata.get("commerceOrder")
        or metadata.get("commerceorder")
        or payment.get("external_reference")
    )


def is_mp_dashboard_test_webhook(data, payment_id):
    return (
        str(payment_id) == "123456"
        and str(data.get("id")) == "123456"
        and data.get("live_mode") is False
        and data.get("type") == "payment"
        and data.get("action") == "payment.updated"
    )


def create_mercadopago_payment(purchase_id, user):
    try:
        purchase = Purchase.objects.get(id=purchase_id)
        products = []

        if purchase.coupon:
            products.append(
                {
                    "id": "discount",
                    "title": "discount",
                    "description": "",
                    "picture_url": "",
                    "category_id": "",
                    "quantity": 1,
                    "currency_id": "CLP",
                    "unit_price": -purchase.discount,
                }
            )

        for purchase_item in PurchaseItem.objects.filter(purchase=purchase):
            products.append(
                {
                    "id": purchase_item.product.id,
                    "title": purchase_item.product.name,
                    "description": "",
                    "picture_url": str(purchase_item.product.thumbnail),
                    "category_id": "",
                    "quantity": purchase_item.quantity,
                    "currency_id": "CLP",
                    "unit_price": purchase_item.product.price,
                }
            )

        client_url = get_client_url()
        back_url = get_back_url()
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
                    "number": user.rut,
                },
            },
            "back_urls": {
                "failure": f"{client_url}/receive/mercadopago",
                "pending": f"{client_url}/receive/mercadopago",
                "success": f"{client_url}/receive/mercadopago",
            },
            "notification_url": (
                f"{back_url}/api/payment/receive/mercadopago/webhook"
            ),
            "auto_return": "approved",
            "external_reference": purchase.code,
            "metadata": {
                "commerceOrder": purchase.code,
                "commerce_order": purchase.code,
                "total_amount": purchase.total,
            },
        }

        sdk = mercadopago.SDK(os.environ.get("MERCADO_PAGO_ACCESS_TOKEN"))
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]
        init_point = get_mp_init_point(preference)

        if not init_point:
            raise ValueError("Mercado Pago did not return a payment URL")

        return {"url": init_point}, 200
    except Purchase.DoesNotExist:
        return {"detail": "Purchase not found"}, 404
    except Exception as exc:
        return {"detail": str(exc)}, 500


class CreateMercadoPagoPayment(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        try:
            commerce_order = request.data.get("commerceOrder")
            if not commerce_order:
                raise ValueError("Order number not received")

            purchase = Purchase.objects.get(code=commerce_order, user=request.user)
            response_data, response_status = create_mercadopago_payment(
                purchase.id,
                request.user,
            )
            return Response(response_data, status=response_status)
        except Purchase.DoesNotExist:
            return Response(
                {"detail": "Purchase not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class ReceiveMercadoPagoPayment(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        try:
            data = parse_request_data(request)
            preference_id = data.get("preference_id")
            collection_status = data.get("collection_status") or data.get("status")

            if not preference_id:
                raise ValueError("Payment failed, please try again")

            sdk = mercadopago.SDK(os.environ.get("MERCADO_PAGO_ACCESS_TOKEN"))
            preference = sdk.preference().get(preference_id)
            preference_data = preference["response"]
            metadata = preference_data.get("metadata") or {}
            commerce_order = (
                metadata.get("commerceOrder")
                or metadata.get("commerce_order")
                or preference_data.get("external_reference")
            )

            if not commerce_order:
                raise ValueError("Order number not found")

            purchase = Purchase.objects.get(code=commerce_order)

            if collection_status == "approved":
                purchase.status = "payed"
                purchase.save(update_fields=["status"])
                createBaseMercadopagoPayment(
                    purchase=purchase,
                    payment=preference,
                    paymentId=preference_id,
                )
                detail = "Payment made correctly"
            else:
                purchase.status = "uncompleted"
                purchase.save(update_fields=["status"])
                detail = "Something went wrong with the payment, try again"

            return Response(
                {"detail": detail, "commerceOrder": commerce_order},
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )


@csrf_exempt
def receiveMercadopagoWebhook(request):
    if request.method != "POST":
        return HttpResponse(status=200)

    try:
        data = parse_request_data(request)
        payment_id = extract_mp_payment_id(request, data)

        if is_mp_dashboard_test_webhook(data, payment_id):
            return JsonResponse(
                {
                    "detail": "Mercado Pago dashboard webhook test received",
                    "paymentId": payment_id,
                },
                status=200,
            )

        if not payment_id:
            return JsonResponse(
                {"detail": "Mercado Pago payment id not received"},
                status=400,
            )

        sdk = mercadopago.SDK(os.environ.get("MERCADO_PAGO_ACCESS_TOKEN"))
        payment_response = sdk.payment().get(payment_id)
        payment = payment_response["response"]

        transaction_status = payment.get("status")
        commerce_order = get_mp_commerce_order(payment)

        if not commerce_order:
            return JsonResponse(
                {
                    "detail": "Mercado Pago webhook received without order reference",
                    "paymentStatus": transaction_status,
                },
                status=200,
            )

        purchase = Purchase.objects.filter(code=commerce_order).first()
        if not purchase:
            return JsonResponse(
                {
                    "detail": "Order number not found",
                    "commerceOrder": commerce_order,
                    "paymentStatus": transaction_status,
                },
                status=200,
            )

        if transaction_status == "approved":
            purchase.status = "payed"
            purchase.save(update_fields=["status"])
            payment_result = createBaseMercadopagoPayment(
                purchase=purchase,
                payment=payment_response,
                paymentId=str(payment_id),
            )
            if payment_result.get("status") != 200:
                print(payment_result.get("detail"))
        elif transaction_status in MERCADO_PAGO_FAILED_STATUSES:
            purchase.status = "uncompleted"
            purchase.save(update_fields=["status"])

        return JsonResponse(
            {
                "detail": "Mercado Pago webhook processed",
                "commerceOrder": commerce_order,
                "paymentStatus": transaction_status,
            },
            status=200,
        )
    except Exception as exc:
        print(exc)
        return JsonResponse({"detail": str(exc)}, status=400)


def create_flow_payment(purchase_id, user):
    try:
        purchase = Purchase.objects.get(id=purchase_id)
        optional = {}

        for purchase_item in PurchaseItem.objects.filter(purchase=purchase):
            optional[purchase_item.product.name] = purchase_item.quantity

        back_url = get_back_url()
        data = {
            "apiKey": os.environ.get("API_KEY_FLOW"),
            "commerceOrder": purchase.code,
            "subject": "Order payment",
            "currency": "CLP",
            "amount": purchase.total,
            "email": user.email,
            "paymentMethod": 9,
            "urlConfirmation": (
                f"{back_url}/api/payment/receive/flow/webhook"
            ),
            "urlReturn": f"{back_url}/api/payment/receive/flow/redirect",
            "optional": json.dumps(optional),
            "timeout": 1800,
        }

        response_data = call_flow_api("post", "payment/create", data)
        redirect_url = response_data["url"] + "?token=" + response_data["token"]
        return {"url": redirect_url}, 200
    except Purchase.DoesNotExist:
        return {"detail": "Purchase not found"}, 404
    except Exception as exc:
        return {"detail": str(exc)}, 500


class CreateFlowPayment(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        try:
            commerce_order = request.data.get("commerceOrder")
            if not commerce_order:
                raise ValueError("Order number not received")

            purchase = Purchase.objects.get(code=commerce_order, user=request.user)
            response_data, response_status = create_flow_payment(
                purchase.id,
                request.user,
            )
            return Response(response_data, status=response_status)
        except Purchase.DoesNotExist:
            return Response(
                {"detail": "Purchase not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class ReceiveFlowPayment(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        try:
            data = parse_request_data(request)
            token = data.get("token") or get_query_param(request, "token")
            if not token:
                raise ValueError("Payment failed, please try again")

            response_data = get_flow_status(token)
            result = update_purchase_from_flow_status(response_data)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as exc:
            print(exc)
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )


@csrf_exempt
def receiveFlowWebhook(request):
    if request.method != "POST":
        return HttpResponse(status=200)

    try:
        data = parse_request_data(request)
        token = data.get("token") or request.POST.get("token")
        if token:
            response_data = get_flow_status(token)
            update_purchase_from_flow_status(response_data)
    except Exception as exc:
        print(exc)

    return HttpResponse(status=200)


@csrf_exempt
def receiveFlowRedirect(request):
    if request.method not in ["GET", "POST"]:
        return HttpResponse(status=200)

    token = request.GET.get("token") or request.POST.get("token")
    if not token:
        return JsonResponse({"detail": "Flow token not received"}, status=400)

    return redirect(f"{get_flow_client_url()}/receive/flow?token={token}")
