// `app/checkout/receive/flow page.tsx` is the UI for the `/checkout/payment` URL

import ReceiveFlow from "../../../components/checkout/receive/flow/receiveFlow";
import { serverApiUrl } from "../../../utils/api";

async function receiveFlowPayment(token: string) {
  try {
    const res = await fetch(serverApiUrl("/api/payment/receive/flow"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: token }),
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
  searchParams: { token },
}: {
  searchParams: { token: string };
}) {
  const { receive, detail, paymentState } = await receiveFlowPayment(token);
  return (
    <ReceiveFlow
      receive={receive}
      detail={detail}
      paymentState={paymentState}
    />
  );
}
