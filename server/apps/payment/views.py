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
import logging
import os

import mercadopago
import requests


logger = logging.getLogger(__name__)


FLOW_STATUS_MAP = {
    1: "pending",
    2: "payed",
    3: "rejected",
    4: "annulled",
}

FLOW_PURCHASE_STATUS_MAP = {
    1: "created",
    2: "payed",
    3: "uncompleted",
    4: "uncompleted",
}

MERCADO_PAGO_FAILED_STATUSES = {
    "cancelled",
    "charged_back",
    "refunded",
    "rejected",
}


def get_payment_provider_timeout():
    try:
        return float(os.environ.get("PAYMENT_PROVIDER_TIMEOUT", "15"))
    except ValueError:
        return 15


def get_required_env(name):
    value = os.environ.get(name)
    if not value:
        raise ValueError(f"{name} not configured")
    return value


def get_public_https_url(name):
    value = get_required_env(name).rstrip("/")
    if not value.startswith("https://"):
        raise ValueError(f"{name} must be a public HTTPS URL")
    if "localhost" in value or "127.0.0.1" in value:
        raise ValueError(f"{name} must not point to localhost")
    return value


def get_mp_mode():
    mode = os.environ.get("MERCADO_PAGO_MODE", "sandbox").strip().lower()
    if mode not in {"sandbox", "production"}:
        raise ValueError("MERCADO_PAGO_MODE must be sandbox or production")
    return mode


def get_mp_access_token():
    return get_required_env("MERCADO_PAGO_ACCESS_TOKEN")


def get_mp_client_url():
    if get_mp_mode() == "production":
        return get_public_https_url("CLIENT_URL_PRO")
    return get_public_https_url("CLIENT_URL_SANDBOX")


def get_flow_mode():
    mode = os.environ.get("FLOW_MODE", "sandbox").strip().lower()
    if mode not in {"sandbox", "production"}:
        raise ValueError("FLOW_MODE must be sandbox or production")
    return mode


def get_flow_client_url():
    if get_flow_mode() == "production":
        return get_public_https_url("CLIENT_URL_PRO")
    return get_public_https_url("CLIENT_URL_SANDBOX")


def get_mp_init_point(preference):
    mode = get_mp_mode()
    if mode == "production":
        return preference.get("init_point") or preference.get("sandbox_init_point")
    return preference.get("sandbox_init_point") or preference.get("init_point")


def get_mp_sdk():
    return mercadopago.SDK(get_mp_access_token())


def get_flow_base_url():
    mode = get_flow_mode()
    if mode == "production":
        return "https://www.flow.cl"
    return "https://sandbox.flow.cl"


def parse_request_data(request):
    request_data = getattr(request, "data", None)
    if request_data:
        if hasattr(request_data, "dict"):
            return request_data.dict()
        return dict(request_data)

    if request.body:
        try:
            return json.loads(request.body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            pass

    if getattr(request, "POST", None):
        return request.POST.dict()

    return {}


def get_query_param(request, name):
    query_params = getattr(request, "query_params", None)
    if query_params is not None:
        return query_params.get(name)
    return request.GET.get(name)


def parse_mp_signature(signature_header):
    signature_data = {}
    for item in signature_header.split(","):
        if "=" not in item:
            continue
        key, value = item.split("=", 1)
        signature_data[key.strip()] = value.strip()
    return signature_data


def build_mp_webhook_manifest(data_id, request_id, timestamp):
    parts = []
    if data_id:
        parts.append(f"id:{str(data_id).lower()}")
    if request_id:
        parts.append(f"request-id:{request_id}")
    parts.append(f"ts:{timestamp}")
    return ";".join(parts) + ";"


def extract_mp_webhook_payment_id(request, data):
    data_id = get_query_param(request, "data.id") or get_query_param(request, "data_id")
    if data_id:
        return str(data_id)

    if isinstance(data, dict):
        nested_data = data.get("data")
        if isinstance(nested_data, dict) and nested_data.get("id"):
            return str(nested_data["id"])

    return None


def validate_mp_webhook_signature(request, data_id):
    secret = get_required_env("MERCADO_PAGO_WEBHOOK_SECRET")
    signature_header = request.headers.get("x-signature")
    request_id = request.headers.get("x-request-id")

    if not signature_header:
        raise ValueError("Mercado Pago webhook signature not received")

    signature_data = parse_mp_signature(signature_header)
    timestamp = signature_data.get("ts")
    signature = signature_data.get("v1")

    if not timestamp:
        raise ValueError("Mercado Pago webhook timestamp not received")
    if not signature:
        raise ValueError("Mercado Pago webhook signature hash not received")

    manifest = build_mp_webhook_manifest(
        data_id=data_id,
        request_id=request_id,
        timestamp=timestamp,
    )
    expected_signature = hmac.new(
        secret.encode("utf-8"),
        manifest.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, signature):
        raise ValueError("Invalid Mercado Pago webhook signature")

    return True


def get_mp_response(sdk_response, action, ok_statuses=(200, 201)):
    http_status = sdk_response.get("status")
    response = sdk_response.get("response") or {}

    if http_status not in ok_statuses:
        detail = response.get("message") or response.get("error") or response
        raise ValueError(f"Mercado Pago {action} failed ({http_status}): {detail}")

    return response


def build_mercadopago_preference(purchase, user):
    client_url = get_mp_client_url()
    back_url = get_public_https_url("BACK_URL")

    return {
        "items": [
            {
                "id": purchase.code,
                "title": f"Order {purchase.code}",
                "quantity": 1,
                "currency_id": "CLP",
                "unit_price": float(purchase.total),
            }
        ],
        "back_urls": {
            "failure": f"{client_url}/receive/mercadopago",
            "pending": f"{client_url}/receive/mercadopago",
            "success": f"{client_url}/receive/mercadopago",
        },
        "notification_url": f"{back_url}/api/payment/receive/mercadopago/webhook",
        "auto_return": "approved",
        "external_reference": purchase.code,
        "metadata": {
            "commerceOrder": purchase.code,
            "commerce_order": purchase.code,
            "total_amount": float(purchase.total),
        },
    }


def get_mp_commerce_order(payment_data):
    metadata = payment_data.get("metadata") or {}
    return (
        metadata.get("commerceOrder")
        or metadata.get("commerce_order")
        or metadata.get("commerceorder")
        or payment_data.get("external_reference")
    )


def create_mercadopago_payment(purchase_id, user):
    try:
        purchase = Purchase.objects.get(id=purchase_id)
        sdk = get_mp_sdk()
        preference_data = build_mercadopago_preference(purchase, user)
        preference_response = sdk.preference().create(preference_data)
        preference = get_mp_response(preference_response, "preference creation")
        init_point = get_mp_init_point(preference)

        if not init_point:
            raise ValueError("Mercado Pago did not return a payment URL")

        return {"url": init_point}, status.HTTP_200_OK
    except Purchase.DoesNotExist:
        return {"detail": "Purchase not found"}, status.HTTP_404_NOT_FOUND
    except ValueError as exc:
        return {"detail": str(exc)}, status.HTTP_400_BAD_REQUEST
    except Exception as exc:
        return {"detail": str(exc)}, status.HTTP_502_BAD_GATEWAY


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

            preference_id = data.get("preference_id") or get_query_param(
                request,
                "preference_id",
            )
            payment_id = (
                data.get("payment_id")
                or data.get("collection_id")
                or get_query_param(request, "payment_id")
                or get_query_param(request, "collection_id")
            )
            transaction_status = (
                data.get("status")
                or data.get("collection_status")
                or get_query_param(request, "status")
                or get_query_param(request, "collection_status")
            )
            commerce_order = data.get("external_reference") or get_query_param(
                request,
                "external_reference",
            )

            sdk = None
            if not commerce_order and payment_id:
                sdk = get_mp_sdk()
                payment = get_mp_response(
                    sdk.payment().get(payment_id),
                    "payment lookup",
                    ok_statuses=(200,),
                )
                commerce_order = get_mp_commerce_order(payment)
                transaction_status = transaction_status or payment.get("status")
                preference_id = preference_id or payment.get("preference_id")

            if not commerce_order and preference_id:
                sdk = sdk or get_mp_sdk()
                preference = get_mp_response(
                    sdk.preference().get(preference_id),
                    "preference lookup",
                    ok_statuses=(200,),
                )
                metadata = preference.get("metadata") or {}
                commerce_order = (
                    metadata.get("commerceOrder")
                    or metadata.get("commerce_order")
                    or metadata.get("commerceorder")
                    or preference.get("external_reference")
                )

            if not commerce_order:
                raise ValueError("Order number not found in Mercado Pago return")

            return Response(
                {
                    "detail": "Payment return received",
                    "commerceOrder": commerce_order,
                    "paymentStatus": transaction_status,
                },
                status=status.HTTP_200_OK,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)


@csrf_exempt
def receiveMercadopagoWebhook(request):
    if request.method != "POST":
        return HttpResponse(status=200)

    data = parse_request_data(request)
    payment_id = extract_mp_webhook_payment_id(request, data)

    try:
        validate_mp_webhook_signature(request, payment_id)
    except ValueError as exc:
        return JsonResponse({"detail": str(exc)}, status=401)

    if not payment_id:
        return JsonResponse(
            {"detail": "Mercado Pago payment data.id not received"},
            status=400,
        )

    try:
        sdk = get_mp_sdk()
        payment_response = sdk.payment().get(payment_id)
        payment = get_mp_response(
            payment_response,
            "payment lookup",
            ok_statuses=(200,),
        )

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
            if purchase.status != "payed":
                purchase.status = "payed"
                purchase.save(update_fields=["status"])

            payment_result = createBaseMercadopagoPayment(
                purchase=purchase,
                payment={"response": payment},
                paymentId=str(payment_id),
                provider_status="payed",
            )
            if payment_result.get("status") != 200:
                return JsonResponse(
                    {"detail": str(payment_result.get("detail"))},
                    status=500,
                )
        elif transaction_status in MERCADO_PAGO_FAILED_STATUSES:
            if purchase.status != "uncompleted":
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
    except ValueError as exc:
        return JsonResponse({"detail": str(exc)}, status=400)
    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=502)


def sign_flow_params(params, secret_key):
    keys = sorted(key for key in params.keys() if key != "s")
    string_to_sign = "".join([f"{key}{params[key]}" for key in keys])
    return hmac.new(
        secret_key.encode("utf-8"),
        string_to_sign.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def call_flow_api(method, endpoint, params, secret_key):
    signed_params = params.copy()
    signed_params["s"] = sign_flow_params(signed_params, secret_key)
    url = f"{get_flow_base_url()}/api/{endpoint.lstrip('/')}"
    timeout = get_payment_provider_timeout()

    try:
        if method == "post":
            response = requests.post(
                url,
                data=signed_params,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                timeout=timeout,
            )
        else:
            response = requests.get(
                url,
                params=signed_params,
                headers={"Accept": "application/json"},
                timeout=timeout,
            )
    except requests.Timeout:
        raise ValueError("Flow request timed out")
    except requests.RequestException as exc:
        raise ValueError(f"Flow request failed: {exc}")

    try:
        response_data = response.json()
    except ValueError:
        if response.status_code == 200:
            raise ValueError("Flow returned invalid JSON")
        response_data = {}

    if response.status_code != 200:
        detail = (
            response_data.get("message")
            or response_data.get("error")
            or response.text[:300]
            or "The Flow request could not be processed"
        )
        if (
            response.status_code == 401
            and os.environ.get("FLOW_MODE", "sandbox").lower() == "sandbox"
            and "apikey not found" in str(detail).lower()
        ):
            raise ValueError(
                "Flow sandbox API key not found. Configure API_KEY_FLOW and "
                "SECRET_KEY_FLOW with sandbox credentials, not production credentials."
            )
        raise ValueError(f"Flow request failed ({response.status_code}): {detail}")

    return response_data


def get_flow_credentials():
    return get_required_env("API_KEY_FLOW"), get_required_env("SECRET_KEY_FLOW")


def get_flow_payment_status(token):
    api_key, secret_key = get_flow_credentials()
    flow_data = {
        "apiKey": api_key,
        "token": token,
    }
    return call_flow_api("get", "payment/getStatus", flow_data, secret_key)


def normalize_flow_status(flow_status):
    try:
        status_code = int(flow_status)
    except (TypeError, ValueError):
        return None, str(flow_status or "unknown")

    return status_code, FLOW_STATUS_MAP.get(status_code, "unknown")


def process_flow_status_response(response_data):
    status_code, status_name = normalize_flow_status(response_data.get("status"))
    commerce_order = response_data.get("commerceOrder")

    if not commerce_order:
        raise ValueError("Order number not found in Flow response")

    result = {
        "commerceOrder": commerce_order,
        "paymentStatus": status_name,
        "paymentStatusCode": status_code,
        "purchaseProcessed": False,
        "paymentPersisted": None,
    }

    purchase = Purchase.objects.filter(code=commerce_order).first()
    if not purchase:
        logger.error("Flow confirmation received for unknown order %s", commerce_order)
        result["detail"] = "Flow confirmation received for unknown order"
        return result

    purchase_status = FLOW_PURCHASE_STATUS_MAP.get(status_code)
    if purchase_status and purchase.status != purchase_status:
        purchase.status = purchase_status
        purchase.save(update_fields=["status"])

    result["purchaseProcessed"] = True

    if status_code == 2:
        payment_result = createBaseFlowPayment(
            purchase=purchase,
            response_data=response_data,
            provider_status=status_name,
        )
        if payment_result.get("status") == 200:
            result["paymentPersisted"] = True
        else:
            result["paymentPersisted"] = False
            result["paymentPersistenceWarning"] = "Payment record could not be persisted"
            logger.error(
                "Flow payment persistence failed for order %s: %s",
                commerce_order,
                payment_result.get("detail"),
            )

    return result


def build_flow_payment_data(purchase, user):
    api_key, secret_key = get_flow_credentials()
    back_url = get_public_https_url("BACK_URL")

    optional = {}
    for purchase_item in PurchaseItem.objects.filter(purchase=purchase):
        optional[purchase_item.product.name] = purchase_item.quantity

    return (
        {
            "apiKey": api_key,
            "commerceOrder": purchase.code,
            "subject": "Order payment",
            "currency": "CLP",
            "amount": purchase.total,
            "email": user.email,
            "paymentMethod": 9,
            "urlConfirmation": f"{back_url}/api/payment/receive/flow/webhook",
            "urlReturn": f"{back_url}/api/payment/receive/flow/redirect",
            "optional": json.dumps(optional, separators=(",", ":")),
            "timeout": 1800,
        },
        secret_key,
    )


def create_flow_payment(purchase_id, user):
    try:
        purchase = Purchase.objects.get(id=purchase_id)
        flow_data, secret_key = build_flow_payment_data(purchase, user)
        response_data = call_flow_api(
            "post",
            "payment/create",
            flow_data,
            secret_key,
        )

        url = response_data.get("url")
        token = response_data.get("token")
        if not url or not token:
            raise ValueError("Flow did not return a payment URL")

        return {"url": f"{url}?token={token}"}, status.HTTP_200_OK
    except Purchase.DoesNotExist:
        return {"detail": "Purchase not found"}, status.HTTP_404_NOT_FOUND
    except ValueError as exc:
        return {"detail": str(exc)}, status.HTTP_400_BAD_REQUEST
    except Exception as exc:
        return {"detail": str(exc)}, status.HTTP_502_BAD_GATEWAY


class CreateFlowPayment(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        try:
            commerce_order = request.data.get("commerceOrder")
            if not commerce_order:
                raise ValueError("Order number not received")

            purchase = Purchase.objects.get(code=commerce_order, user=request.user)
            response_data, response_status = create_flow_payment(purchase.id, request.user)
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
                raise ValueError("Flow token not received")

            response_data = get_flow_payment_status(token)
            flow_result = process_flow_status_response(response_data)

            return Response(
                {
                    "detail": "Payment return received",
                    **flow_result,
                },
                status=status.HTTP_200_OK,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)


@csrf_exempt
def receiveFlowWebhook(request):
    if request.method != "POST":
        return HttpResponse(status=200)

    try:
        data = parse_request_data(request)
        token = data.get("token") or request.POST.get("token")
        if not token:
            raise ValueError("Flow token not received")

        response_data = get_flow_payment_status(token)
        flow_result = process_flow_status_response(response_data)

        return JsonResponse(
            {
                "detail": "Flow webhook processed",
                **flow_result,
            },
            status=200,
        )
    except ValueError as exc:
        return JsonResponse({"detail": str(exc)}, status=400)
    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=502)


@csrf_exempt
def receiveFlowRedirect(request):
    if request.method not in ["GET", "POST"]:
        return HttpResponse(status=200)

    token = request.GET.get("token") or request.POST.get("token")
    if not token:
        return JsonResponse({"detail": "Flow token not received"}, status=400)

    try:
        client_url = get_flow_client_url()
    except ValueError as exc:
        return JsonResponse({"detail": str(exc)}, status=400)

    return redirect(f"{client_url}/receive/flow?token={token}")
