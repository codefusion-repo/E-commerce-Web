// `app/checkout/receive/mercadopago page.tsx` is the UI for the `/checkout/payment` URL

import ReceiveMercadopago from "../../../components/checkout/receive/mercadopago/receiveMercadopago";

async function receiveMercadopagoPayment(
  collection_status: string,
  preference_id: string
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL_DOCKER}/api/payment/receive/mercadopago`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: JSON.stringify({
          collection_status: collection_status,
          preference_id: preference_id,
        }),
        cache: "no-store",
      }
    );
    if (res.status === 200) {
      const data = await res.json();

      return {
        receive: `/profile/purchases/purchase/${data.commerceOrder}`,
        detail: data.detail || "Payment failed, please try again.",
      };
    } else {
      return {
        receive: `/profile/purchases`,
        detail: "Payment failed, please try again.",
      };
    }
  } catch {
    return {
      receive: `/profile/purchases`,
      detail: "Payment failed, please try again.",
    };
  }
}

export default async function Page({
  searchParams: { collection_status, preference_id },
}: {
  searchParams: {
    collection_status: string;
    preference_id: string;
  };
}) {
  const { receive, detail } = await receiveMercadopagoPayment(
    collection_status,
    preference_id
  );
  return <ReceiveMercadopago receive={receive} detail={detail} />;
}
