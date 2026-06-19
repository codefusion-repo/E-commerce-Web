// `app/checkout/receive/mercadopago page.tsx` is the UI for the `/checkout/payment` URL

import ReceiveMercadopago from "../../../components/checkout/receive/mercadopago/receiveMercadopago";
import { serverApiUrl } from "../../../utils/api";

async function receiveMercadopagoPayment(
  collection_status: string,
  preference_id: string,
  payment_id?: string,
  collection_id?: string,
  status?: string,
  external_reference?: string
) {
  try {
    const res = await fetch(serverApiUrl("/api/payment/receive/mercadopago"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection_status,
        preference_id,
        payment_id,
        collection_id,
        status,
        external_reference,
      }),
      cache: "no-store",
    });
    if (res.status === 200) {
      const data = await res.json();
      const receive = data.commerceOrder
        ? `/profile/purchases/purchase/${data.commerceOrder}`
        : "/checkout/payment";

      return {
        receive,
        detail: data.detail || "Payment failed, please try again.",
        paymentState: data.paymentState || "verifying",
      };
    } else {
      return {
        receive: `/checkout/payment`,
        detail: "Payment failed, please try again.",
        paymentState: "failed",
      };
    }
  } catch {
    return {
      receive: `/checkout/payment`,
      detail: "Payment failed, please try again.",
      paymentState: "failed",
    };
  }
}

export default async function Page({
  searchParams: {
    collection_status,
    preference_id,
    payment_id,
    collection_id,
    status,
    external_reference,
  },
}: {
  searchParams: {
    collection_status: string;
    preference_id: string;
    payment_id?: string;
    collection_id?: string;
    status?: string;
    external_reference?: string;
  };
}) {
  const { receive, detail, paymentState } = await receiveMercadopagoPayment(
    collection_status,
    preference_id,
    payment_id,
    collection_id,
    status,
    external_reference
  );
  return (
    <ReceiveMercadopago
      receive={receive}
      detail={detail}
      paymentState={paymentState}
    />
  );
}
