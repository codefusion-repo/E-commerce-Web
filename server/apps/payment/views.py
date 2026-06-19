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
MERCADO_PAGO_PENDING_STATUSES = {
    "authorized",
    "in_mediation",
    "in_process",
    "pending",
}
MERCADO_PAGO_SUCCESS_STATUSES = {"approved"}
MERCADO_PAGO_RETURN_FAILED_STATUSES = {
    "cancelled",
    "failure",
    "failed",
    "rejected",
}
MERCADO_PAGO_RETURN_PENDING_STATUSES = {
    "in_process",
    "pending",
    "verifying",
}
FLOW_PAID_STATUS = 2
FLOW_PENDING_STATUSES = {1}
FLOW_FAILED_STATUSES = {3, 4}
SAFE_PROVIDER_ERROR = (
    "Payment provider could not process the request. Please try again."
)


def get_public_url(*names):
    for name in names:
        value = os.environ.get(name, "").strip().rstrip("/")
        if value:
            return value
    return ""


def get_client_url():
    return get_public_url(
        "PUBLIC_CLIENT_URL",
        "CLIENT_URL",
        "FRONTEND_URL",
        "CLIENT_URL_PRO",
        "NEXT_PUBLIC_SITE_URL",
        "CLIENT_URL_SANDBOX",
    )


def get_flow_client_url():
    return get_client_url()


def get_back_url():
    return get_public_url(
        "PUBLIC_API_URL",
        "BACK_URL",
        "BACKEND_URL",
        "API_URL",
        "NEXT_PUBLIC_API_URL",
    )


def require_public_url(url, label):
    if not url:
        raise ValueError(f"{label} is not configured")
    return url


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
    if not secret_key:
        raise ValueError("Flow credentials are not configured")

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
        raise ValueError(SAFE_PROVIDER_ERROR)

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


def mark_purchase_paid(purchase):
    if purchase.status != "payed":
        purchase.status = "payed"
        purchase.save(update_fields=["status"])

    if purchase.coupon and purchase.coupon.status != "is_used":
        purchase.coupon.status = "is_used"
        purchase.coupon.save(update_fields=["status"])


def mark_purchase_failed(purchase):
    if purchase.status != "payed":
        purchase.status = "uncompleted"
        purchase.save(update_fields=["status"])


def build_payment_response(detail, commerce_order, provider_status, payment_state):
    return {
        "detail": detail,
        "commerceOrder": commerce_order,
        "paymentStatus": provider_status,
        "paymentState": payment_state,
    }


def update_purchase_from_flow_status(response_data):
    transaction_status = int(response_data["status"])
    commerce_order = response_data["commerceOrder"]
    purchase = Purchase.objects.get(code=commerce_order)

    if transaction_status == FLOW_PAID_STATUS:
        mark_purchase_paid(purchase)
        payment_result = createBaseFlowPayment(
            purchase=purchase,
            response_data=response_data,
        )
        if payment_result.get("status") == 200:
            return build_payment_response(
                "Payment made correctly",
                commerce_order,
                transaction_status,
                "paid",
            )
        return build_payment_response(
            "Payment was confirmed, but the local receipt is still being processed.",
            commerce_order,
            transaction_status,
            "paid",
        )

    if transaction_status in FLOW_FAILED_STATUSES:
        mark_purchase_failed(purchase)
        return build_payment_response(
            "Payment failed or was cancelled. Your cart is still available.",
            commerce_order,
            transaction_status,
            "failed",
        )

    return build_payment_response(
        "Payment is pending confirmation. Your cart is still available.",
        commerce_order,
        transaction_status,
        "pending",
    )


def extract_mp_payment_id(request, data):
    payment_id = (
        data.get("payment_id")
        or data.get("collection_id")
        or data.get("id")
        or get_query_param(request, "payment_id")
        or get_query_param(request, "collection_id")
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


def get_mp_preference_id(request, data):
    preference_id = data.get("preference_id") or get_query_param(
        request,
        "preference_id",
    )
    return str(preference_id) if preference_id else None


def get_mp_return_status(request, data):
    raw_status = (
        data.get("collection_status")
        or data.get("status")
        or get_query_param(request, "collection_status")
        or get_query_param(request, "status")
    )
    if not raw_status:
        return "verifying"

    normalized = str(raw_status).lower()
    if normalized in {"approved", "success"}:
        return "success"
    if normalized in MERCADO_PAGO_RETURN_PENDING_STATUSES:
        return "pending"
    if normalized in MERCADO_PAGO_RETURN_FAILED_STATUSES:
        return "failed"
    return "verifying"


def get_mp_preference_commerce_order(preference_data):
    metadata = preference_data.get("metadata") or {}
    return (
        metadata.get("commerceOrder")
        or metadata.get("commerce_order")
        or preference_data.get("external_reference")
    )


def get_mp_return_commerce_order(request, data):
    return (
        data.get("external_reference")
        or data.get("commerceOrder")
        or data.get("commerce_order")
        or get_query_param(request, "external_reference")
        or get_query_param(request, "commerceOrder")
        or get_query_param(request, "commerce_order")
    )


def get_mp_payment_state(provider_status, return_status):
    if provider_status in MERCADO_PAGO_SUCCESS_STATUSES:
        return "paid"
    if provider_status in MERCADO_PAGO_PENDING_STATUSES:
        return "pending"
    if provider_status in MERCADO_PAGO_FAILED_STATUSES:
        return "failed"
    if return_status == "failed":
        return "failed"
    if return_status == "pending":
        return "pending"
    return "verifying"


def get_mp_state_detail(payment_state):
    if payment_state == "paid":
        return "Payment made correctly"
    if payment_state == "failed":
        return "Payment failed or was cancelled. Your cart is still available."
    if payment_state == "pending":
        return "Payment is pending confirmation. Your cart is still available."
    return "Payment is being verified. Your cart is still available."


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

        client_url = require_public_url(get_client_url(), "Client URL")
        back_url = require_public_url(get_back_url(), "Backend URL")
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
    except ValueError as exc:
        return {"detail": str(exc)}, 400
    except Exception:
        return {"detail": "Mercado Pago payment link could not be created"}, 500


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
            payment_id = extract_mp_payment_id(request, data)
            preference_id = get_mp_preference_id(request, data)
            return_status = get_mp_return_status(request, data)
            commerce_order = get_mp_return_commerce_order(request, data)
            transaction_status = None
            payment_response = None
            sdk = mercadopago.SDK(os.environ.get("MERCADO_PAGO_ACCESS_TOKEN"))

            if payment_id:
                payment_response = sdk.payment().get(payment_id)
                payment = payment_response["response"]
                transaction_status = payment.get("status")
                commerce_order = get_mp_commerce_order(payment) or commerce_order

            if not commerce_order and preference_id:
                preference = sdk.preference().get(preference_id)
                preference_data = preference["response"]
                commerce_order = get_mp_preference_commerce_order(preference_data)

            if not commerce_order:
                payment_state = get_mp_payment_state(transaction_status, return_status)
                return Response(
                    build_payment_response(
                        get_mp_state_detail(payment_state),
                        None,
                        transaction_status or return_status,
                        payment_state,
                    ),
                    status=status.HTTP_200_OK,
                )

            purchase = Purchase.objects.filter(code=commerce_order).first()
            if not purchase:
                return Response(
                    build_payment_response(
                        "Order number not found",
                        commerce_order,
                        transaction_status or return_status,
                        "verifying",
                    ),
                    status=status.HTTP_200_OK,
                )

            payment_state = get_mp_payment_state(transaction_status, return_status)
            if payment_state == "paid":
                mark_purchase_paid(purchase)
                createBaseMercadopagoPayment(
                    purchase=purchase,
                    payment=payment_response,
                    paymentId=str(payment_id),
                )
            elif payment_state == "failed":
                mark_purchase_failed(purchase)

            return Response(
                build_payment_response(
                    get_mp_state_detail(payment_state),
                    commerce_order,
                    transaction_status or return_status,
                    payment_state,
                ),
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                build_payment_response(
                    "Payment status could not be verified yet. Your cart is still available.",
                    None,
                    "verifying",
                    "verifying",
                ),
                status=status.HTTP_200_OK,
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
            mark_purchase_paid(purchase)
            createBaseMercadopagoPayment(
                purchase=purchase,
                payment=payment_response,
                paymentId=str(payment_id),
            )
        elif transaction_status in MERCADO_PAGO_FAILED_STATUSES:
            mark_purchase_failed(purchase)

        return JsonResponse(
            {
                "detail": "Mercado Pago webhook processed",
                "commerceOrder": commerce_order,
                "paymentStatus": transaction_status,
            },
            status=200,
        )
    except Exception:
        return JsonResponse(
            {"detail": "Mercado Pago webhook could not be processed"},
            status=400,
        )


def create_flow_payment(purchase_id, user):
    try:
        purchase = Purchase.objects.get(id=purchase_id)
        optional = {}

        for purchase_item in PurchaseItem.objects.filter(purchase=purchase):
            optional[purchase_item.product.name] = purchase_item.quantity

        back_url = require_public_url(get_back_url(), "Backend URL")
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
    except ValueError as exc:
        return {"detail": str(exc)}, 400
    except Exception:
        return {"detail": "Flow payment link could not be created"}, 500


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
        except Exception:
            return Response(
                {"detail": "Flow payment could not be verified"},
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
    except Exception:
        pass

    return HttpResponse(status=200)


@csrf_exempt
def receiveFlowRedirect(request):
    if request.method not in ["GET", "POST"]:
        return HttpResponse(status=200)

    token = request.GET.get("token") or request.POST.get("token")
    if not token:
        return JsonResponse({"detail": "Flow token not received"}, status=400)

    client_url = require_public_url(get_flow_client_url(), "Client URL")
    return redirect(f"{client_url}/receive/flow?token={token}")
