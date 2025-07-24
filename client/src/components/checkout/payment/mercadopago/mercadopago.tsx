"use client";
// mercadopago.tsx

import { Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import { postCreateMercadopago } from "./api/action";
import { useAuth } from "../../../../context/auth/authContext";
import { verifyCoupon } from "../../coupons/api/action";
import { useShopcart } from "../../../../context/shopcart/shopcartContext";
import { useCheckout } from "../../../../context/checkout/checkoutContext";
import { useMobile } from "../../../../context/mobile/mobileContext";

export default function Mercadopago({
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

  const handleMercadopagoPayment = () => {
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
    postCreateMercadopago(
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
        console.log(url);

        router.push(url);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  return (
    <>
      <button
        disabled={loading}
        className={`${device > 1 ? "btn-middle" : "btn-large"}  btn-active`}
        onClick={() => handleMercadopagoPayment()}
      >
        Pay with Mercado Pago
      </button>
    </>
  );
}
