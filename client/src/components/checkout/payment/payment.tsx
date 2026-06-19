"use client";
// payment.tsx

//import "./payment.css";
import { useAuth } from "../../../context/auth/authContext";
import { useEffect, useState } from "react";
import Flow from "./flow/flow";
import FlowIcon from "../../../assets/paymentsLogo/FlowIcon.png";
import Mercadopago from "./mercadopago/mercadopago";
import MercadopagoIcon from "../../../assets/paymentsLogo/MercadopagoIcon.png";
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
            <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
              <Image
                className="f-height-xxs"
                src={loadingGif}
                alt="Cargando..."
              />
            </div>
          )}
          {error && (
            <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
              <h4>{error}</h4>
            </div>
          )}
          <div
            className={`flex ${
              device > 1
                ? "box-xl wrap margin-t-l margin-b-l"
                : "box-xxl column gap-s margin-t-s margin-b-s"
            } a-center`}
          >
            <div
              className={`flex ${
                device > 0 ? "box-m" : "box-xl"
              } column gap-xs padding-s`}
            >
              <div className="flex box-xxl column a-center gap-xs">
                <Image
                  className={`${
                    device > 0
                      ? "f-width-ml f-height-xs"
                      : "f-width-m f-height-xs"
                  }`}
                  src={FlowIcon}
                  alt="FlowIcon"
                />
                <h5>Recommended demo payment through Flow.</h5>
              </div>

              <div className="flex box-xxl a-center j-center">
                <Flow
                  setError={setError}
                  setLoading={setLoading}
                  loading={loading}
                />
              </div>
            </div>
            <div
              className={`flex ${
                device > 0 ? "box-m" : "box-xl"
              } column gap-xs padding-s`}
            >
              <div className="flex box-xxl column a-center gap-xs">
                <Image
                  className={`${
                    device > 0
                      ? "f-width-ml f-height-xs"
                      : "f-width-m f-height-xs"
                  }`}
                  src={MercadopagoIcon}
                  alt="MercadopagoIcon"
                />
                <h5>Experimental Mercado Pago sandbox payment.</h5>
              </div>

              <div className="flex box-xxl a-center j-center">
                <Mercadopago
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
