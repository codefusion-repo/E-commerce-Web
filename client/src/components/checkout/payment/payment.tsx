"use client";
// payment.tsx

import "./payment.css";
import { useAuth } from "../../../context/auth/authContext";
import { useEffect, useState } from "react";
import Flow from "./flow/flow";
import FlowIcon from "../../../assets/paymentsLogo/FlowIcon.png";
import Image from "next/image";
import loadingGif from "../../../assets/cargando/loading2.gif";
import { useRouter } from "next/navigation";
import { useModal } from "../../../context/modal/modalContext";
import { useCheckout } from "../../../context/checkout/checkoutContext";
import { useMobile } from "../../../context/mobile/mobileContext";
import { useViewportReveal } from "../../../hooks/useViewportReveal";

export default function Payment() {
  const { device } = useMobile();
  const methodsRevealRef = useViewportReveal();
  const { isAuthenticated } = useAuth();
  const { openModal } = useModal();

  const { setCheckoutStatus } = useCheckout();

  useEffect(() => {
    setCheckoutStatus(2);
  }, [setCheckoutStatus]);

  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/shopcart");
      openModal("login", "Debes ingresar a tu cuenta para continuar");
    }
  }, [isAuthenticated, openModal, router]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <>
      {isAuthenticated && (
        <div className="flex box-xxl column a-center j-start">
          {loading && (
            <div className="payment-alert payment-alert--loading flex box-xxl m-height-xxs column a-center j-center padding-xxs">
              <Image
                className="f-height-xxs"
                src={loadingGif}
                alt="Cargando..."
              />
            </div>
          )}
          {error && (
            <div
              className="payment-alert payment-alert--error flex box-xxl m-height-xxs column a-center j-center padding-xxs"
              role="alert"
            >
              <h4>{error}</h4>
            </div>
          )}
          <div
            ref={methodsRevealRef}
            className={`payment-methods flex ${
              device > 1
                ? "box-xl wrap margin-t-l margin-b-l"
                : "box-xxl column gap-s margin-t-s margin-b-s"
            } a-center reveal reveal--slide-up`}
          >
            <div
              className={`payment-method-card flex ${
                device > 0 ? "box-m" : "box-xl"
              } column gap-xs padding-s`}
            >
              <div className="payment-method-card__header flex box-xxl column a-center gap-xs">
                <span>Pago disponible</span>
                <Image
                  className={`payment-method-card__logo ${
                    device > 0
                      ? "f-width-ml f-height-xs"
                      : "f-width-m f-height-xs"
                  }`}
                  src={FlowIcon}
                  alt="Flow"
                />
                <h5>Flow es el proveedor activo para esta demo.</h5>
                <p className="payment-method-card__notice">
                  Usa solo datos de prueba; no ingreses datos de pago reales.
                </p>
              </div>

              <div className="payment-method-card__action flex box-xxl a-center j-center">
                <Flow
                  setError={setError}
                  setLoading={setLoading}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
