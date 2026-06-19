"use client";
// receiveMercadopago.tsx

// import "./receiveMercadopago.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMessages } from "../../../../context/messages/messagesContext";
import { useAuth } from "../../../../context/auth/authContext";
import { getProfile } from "../../../../components/profile/profileEditor/api/action";
import Image from "next/image";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import { useShopcart } from "../../../../context/shopcart/shopcartContext";

export default function ReceiveMercadopago({
  receive,
  detail,
  paymentState,
}: {
  receive: string;
  detail: string;
  paymentState: string;
}) {
  const { setUser } = useAuth();
  const { addMessage } = useMessages();

  const { clearShop } = useShopcart();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>("Receiving payment");
  const [loading, setLoading] = useState<boolean>(true);

  const handlersRef = useRef({
    addMessage,
    clearShop,
    router,
    setUser,
  });

  useEffect(() => {
    handlersRef.current = {
      addMessage,
      clearShop,
      router,
      setUser,
    };
  }, [addMessage, clearShop, router, setUser]);

  useEffect(() => {
    let cancelled = false;
    const destination = receive || "/checkout/payment";
    const message = detail || "Payment status received.";

    const finishPaymentReturn = async () => {
      try {
        if (paymentState === "paid") {
          handlersRef.current.clearShop();
        }

        try {
          const res = await getProfile(() => undefined);
          if (!cancelled && res?.data?.user) {
            handlersRef.current.setUser(res.data.user);
          }
        } catch {
          // Profile refresh is best-effort; payment result navigation must continue.
        }

        if (cancelled) {
          return;
        }

        setError(message);
        handlersRef.current.addMessage(message);

        if (destination) {
          setInfo("Redirecting...");
          handlersRef.current.router.push(destination);
          return;
        }

        setInfo("Payment status received.");
        setLoading(false);
      } catch {
        if (cancelled) {
          return;
        }

        const fallbackMessage =
          detail || "Payment status could not be completed. Please try again.";
        setError(fallbackMessage);
        handlersRef.current.addMessage(fallbackMessage);
        setInfo("Redirecting...");
        handlersRef.current.router.push("/checkout/payment");
      }
    };

    finishPaymentReturn();

    return () => {
      cancelled = true;
    };
  }, [detail, paymentState, receive]);

  return (
    <>
      {loading && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <Image className="f-height-xxs" src={loadingGif} alt="Loading..." />
        </div>
      )}
      {error && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <h3>{error}</h3>
        </div>
      )}
      {info && (
        <div className="flex box-xxl m-height-xxs column a-end j-end">
          <h3>{info}</h3>
        </div>
      )}
    </>
  );
}
