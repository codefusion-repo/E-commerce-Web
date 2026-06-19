"use client";
// flow.tsx

import { useAuth } from "../../../../context/auth/authContext";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { useShopcart } from "../../../../context/shopcart/shopcartContext";
import { useCheckout } from "../../../../context/checkout/checkoutContext";
import { useMobile } from "../../../../context/mobile/mobileContext";
import { postCreatePurchaseOrder } from "../../../../components/profile/purchases/api/action";

export default function Flow({
  setError,
  setLoading,
  loading,
}: {
  setError: Dispatch<SetStateAction<string | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
}) {
  const { device } = useMobile();
  const { items, coupon } = useShopcart();
  const { selectedCourier, selectedAddress } = useCheckout();
  const { signOutAuthState } = useAuth();
  const router = useRouter();

  /* const handleFlowPayment = () => {
    setError(null);
    setLoading(true);

    if (coupon && discount > 0) {
      verifyCoupon(coupon?.code, signOutAuthState)
        .then(() => {
          sendPayment();
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    } else {
      sendPayment();
    }
  };*/

  const handleFlowPayment = () => {
    setError(null);
    setLoading(true);

    postCreatePurchaseOrder(
      items,
      selectedCourier,
      selectedAddress?.id,
      "f",
      signOutAuthState,
      coupon?.coupon.code
      )
      .then((url) => {
        setLoading(false);
        router.push(url);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  return (
    <button
      disabled={loading}
      className={`${device > 1 ? "btn-middle" : "btn-large"}  btn-active`}
      onClick={() => handleFlowPayment()}
    >
      Pay with Flow
    </button>
  );
}
