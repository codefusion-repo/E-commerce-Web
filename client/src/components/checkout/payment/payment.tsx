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

export default function Payment() {
  const { device } = useMobile();
  const { isAuthenticated } = useAuth();
  const { openModal } = useModal();

  const { setCheckoutStatus } = useCheckout();

  useEffect(() => {
    setCheckoutStatus(2);
  }, []);

  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/shopcart");
      openModal("login", "You must be authenticated to continue");
    }
  }, [isAuthenticated]);

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
            className={`payment-methods flex ${
              device > 1
                ? "box-xl wrap margin-t-l margin-b-l"
                : "box-xxl column gap-s margin-t-s margin-b-s"
            } a-center`}
          >
            <div
              className={`payment-method-card flex ${
                device > 0 ? "box-m" : "box-xl"
              } column gap-xs padding-s`}
            >
              <div className="payment-method-card__header flex box-xxl column a-center gap-xs">
                <span>Available payment</span>
                <Image
                  className={`payment-method-card__logo ${
                    device > 0
                      ? "f-width-ml f-height-xs"
                      : "f-width-m f-height-xs"
                  }`}
                  src={FlowIcon}
                  alt="FlowIcon"
                />
                <h5>Flow is the active checkout provider.</h5>
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
