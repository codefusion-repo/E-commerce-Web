"use client";
// resendFlow.tsx

import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/auth/authContext";
import { postResendFlow } from "./api/action";
import { useMobile } from "../../../../context/mobile/mobileContext";
import { PurchaseItemType } from "../../../../interfaces/auth/authInterface";

export default function ResendFlow({
  setError,
  setLoading,
  loading,
  commerceOrder,
  items,
  deliveryCost,
  discount,
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

  const handleFlowPayment = () => {
    setError(null);
    setLoading(true);

    resendPayment();
  };

  const resendPayment = () => {
    postResendFlow(
      commerceOrder,
      items,
      deliveryCost,
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
    <button
      disabled={loading}
      className={`${device > 1 ? "btn-middle" : "btn-large"}  btn-active`}
      onClick={() => handleFlowPayment()}
    >
      Pay with Flow
    </button>
  );
}
