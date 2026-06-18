from apps.myAuth.utils import SendEmail

from .models import Payment


def send_payment_email_once(purchase, created):
    if not created:
        return

    SendEmail(
        email=purchase.user.email,
        name=purchase.user.first_name,
        templateId=6533966,
        subject=f"Purchase order: {purchase.code} paid | CodeFusion.cl",
        variables={
            "name": purchase.user.first_name,
            "order_id": purchase.code,
            "total_price": purchase.total,
            "url": f"https://ecommerce-demo.codefusion.cl/profile/purchases/purchase/{purchase.code}",
        },
    )


def get_or_create_payment(purchase, method, provider_payment_id):
    payment = Payment.objects.filter(purchase=purchase, method=method).first()
    if payment:
        return payment, False

    payment = Payment.objects.create(
        id=str(provider_payment_id),
        user=purchase.user,
        purchase=purchase,
        method=method,
    )
    return payment, True


def createBaseFlowPayment(purchase, response_data, provider_status="payed"):
    try:
        flow_order = str(response_data["flowOrder"])
        payment_data = response_data.get("paymentData") or {}
        payment, created = get_or_create_payment(
            purchase=purchase,
            method="flow",
            provider_payment_id=flow_order,
        )

        payment.provider_payment_id = flow_order
        payment.provider_order_id = str(response_data.get("commerceOrder") or purchase.code)
        payment.status = provider_status
        payment.media = payment_data.get("media") or "flow"
        payment.payerEmail = response_data.get("payer") or purchase.user.email
        payment.currency = response_data.get("currency") or "CLP"
        payment.amount = float(response_data.get("amount") or purchase.total)
        payment.fee = float(payment_data.get("fee") or 0)
        payment.taxes = float(payment_data.get("taxes") or 0)
        payment.received = float(payment_data.get("balance") or payment.amount)
        payment.save()

        send_payment_email_once(purchase, created)

        return {
            "status": 200,
        }
    except Exception as e:
        return {
            "status": 401,
            "detail": str(e),
        }


def createBaseMercadopagoPayment(purchase, payment, paymentId, provider_status="payed"):
    try:
        payment_response = payment["response"]
        metadata = payment_response.get("metadata") or {}
        total_amount = (
            metadata.get("total_amount")
            or payment_response.get("transaction_amount")
            or purchase.total
        )

        updated_payment, created = get_or_create_payment(
            purchase=purchase,
            method="mercadopago",
            provider_payment_id=paymentId,
        )

        updated_payment.provider_payment_id = str(paymentId)
        updated_payment.provider_order_id = str(
            payment_response.get("external_reference") or purchase.code
        )
        updated_payment.status = provider_status
        updated_payment.media = "mercadopago"
        updated_payment.payerEmail = (
            (payment_response.get("payer") or {}).get("email")
            or purchase.user.email
        )
        updated_payment.currency = "CLP"
        updated_payment.amount = float(total_amount)
        updated_payment.fee = 0
        updated_payment.taxes = 0
        updated_payment.received = float(total_amount)
        updated_payment.save()

        send_payment_email_once(purchase, created)

        return {
            "status": 200,
        }
    except Exception as e:
        return {
            "status": 401,
            "detail": str(e),
        }
