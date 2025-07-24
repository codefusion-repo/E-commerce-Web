// `app/checkout/receive/flow page.tsx` is the UI for the `/checkout/payment` URL

import ReceiveFlow from "../../../components/checkout/receive/flow/receiveFlow";

async function receiveFlowPayment(token: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL_DOCKER}/api/payment/receive/flow`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: JSON.stringify({ token: token }),
        cache: "no-store",
      }
    );
    if (res.status === 200) {
      const data = await res.json();
      console.log("data: ", data);
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
  searchParams: { token },
}: {
  searchParams: { token: string };
}) {
  const { receive, detail } = await receiveFlowPayment(token);
  return <ReceiveFlow receive={receive} detail={detail} />;
}
