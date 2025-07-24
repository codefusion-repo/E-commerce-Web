"use client";
// flow.tsx

import { useAuth } from "../../../../context/auth/authContext";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { postCreateFlow } from "./api/action";
import { verifyCoupon } from "../../coupons/api/action";
import { useShopcart } from "../../../../context/shopcart/shopcartContext";
import { useCheckout } from "../../../../context/checkout/checkoutContext";
import { useMobile } from "../../../../context/mobile/mobileContext";

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
  const { cartId, items, coupon, discount } = useShopcart();
  const { selectedCourier, selectedAddress } = useCheckout();
  const { signOutAuthState } = useAuth();
  const router = useRouter();

  const handleFlowPayment = () => {
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
  };

  const sendPayment = () => {
    postCreateFlow(
      cartId,
      items,
      selectedCourier,
      selectedAddress,
      coupon?.code,
      discount,

      signOutAuthState
    )
      .then((url) => {
        setLoading(false);
        console.log("url: ", url);
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
