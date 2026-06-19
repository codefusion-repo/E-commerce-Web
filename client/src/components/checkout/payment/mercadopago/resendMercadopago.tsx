"use client";
// resendMercadopago.tsx

import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/auth/authContext";
import { useMobile } from "../../../../context/mobile/mobileContext";
import { PurchaseItemType } from "../../../../interfaces/auth/authInterface";
import { postResendPurchaseOrder } from "../../../../components/profile/purchases/api/action";

export default function ResendMercadopago({
  setError,
  setLoading,
  loading,
  commerceOrder,
}: {
  setError: Dispatch<SetStateAction<string | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  commerceOrder: string;
  items: PurchaseItemType[];
  deliveryCost: number;
  discount: number;
}) {
  const { device } = useMobile();
  const router = useRouter();
  const { signOutAuthState } = useAuth();

  const handleMercadopagoPayment = () => {
    setError(null);
    setLoading(true);

    postResendPurchaseOrder(commerceOrder, "mp", signOutAuthState)
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
      onClick={() => handleMercadopagoPayment()}
    >
      Pay with Mercado Pago
    </button>
  );
}
