"use client";
// purchase.tsx

import { useEffect, useState } from "react";
import "./purchase.css";
import { useAuth } from "../../../../context/auth/authContext";
import Image from "next/image";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import ResendFlow from "../../../../components/checkout/payment/flow/resendFlow";
import { FiPackage } from "react-icons/fi";
import { LuPackageOpen } from "react-icons/lu";
import { GrDeliver } from "react-icons/gr";
import { FaPersonCircleCheck } from "react-icons/fa6";
import { postUnapplyCouponFromPurchase } from "./api/action";
import { useRouter } from "next/navigation";
import { useModal } from "../../../../context/modal/modalContext";
import FlowIcon from "../../../../assets/paymentsLogo/FlowIcon.png";
import {
  PurchaseItemType,
  PurchaseType,
} from "../../../../interfaces/auth/authInterface";
import { useMobile } from "../../../../context/mobile/mobileContext";
import Coupons from "../../../../components/checkout/coupons/coupons";

export default function Purchase({ code }: { code: string }) {
  const { device } = useMobile();
  const { user, isAuthenticated, signOutAuthState } = useAuth();
  const { openModal } = useModal();

  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      openModal("login", "You must be authenticated to continue");
    }
  }, [isAuthenticated]);

  const order: PurchaseType | undefined = user?.purchases.find(
    (item) => item.code === code
  );

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<PurchaseItemType[]>(order?.items || []);

  const agregarCeroAlMes = (mes: number) => {
    return mes < 10 ? `0${mes}` : mes;
  };
  const formatDate = (creationDate: Date) => {
    const fechaParseada = new Date(creationDate);

    const dia = fechaParseada.getDate();
    const mes = fechaParseada.getMonth() + 1;
    const ano = fechaParseada.getFullYear();

    const fechaFormateada = `${dia}/${agregarCeroAlMes(mes)}/${ano}`;

    return fechaFormateada;
  };

  const onClick = () => {
    setError(null);
    setLoading(true);

    postUnapplyCouponFromPurchase(
      order?.coupon.coupon.code || "",
      code,
      signOutAuthState
    )
      .then(() => {
        //setInfo("Cupón desaplicado");
        router.refresh();
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  const formatSlugToText = (slug: string) => {
    return slug
      .split("-") // Divide el slug por los guiones
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitaliza la primera letra de cada palabra
      .join(" ");
  };

  return (
    <div className="flex box-xxl wrap j-center a-start">
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
        <h2>Purchase order</h2>
        <h4 className="padding-l-xs padding-r-xs">Code: {code.slice(3, 10)}</h4>
        <h4 className="padding-l-xs padding-r-xs">
          Date: {order && formatDate(order.creationDate)}
        </h4>
      </div>

      <div className="flex box-xxl column a-center j-center padding-l-xs padding-r-xs">
        <div className="flex box-xxl f-height-xs base-border-b">
          <div className="flex box-xxl a-center j-center">
            <h4>Product</h4>
          </div>
          {/*<div className="flex box-xxl a-center j-center">
            <h4>Precio c/u</h4>
          </div>*/}
          <div className="flex box-xxl a-center j-center">
            <h4>Quantity</h4>
          </div>
          <div className="flex box-xxl a-center j-center">
            <h4>Subtotal</h4>
          </div>
        </div>

        {isAuthenticated &&
          items &&
          items.map((item, index) => (
            <div className="flex box-xxl m-height-s base-border-b" key={index}>
              <div className="flex column box-xxl a-center j-space gap-xxs">
                <h5 className="padding-l-s padding-r-s">
                  {item.product.name.length > 15
                    ? `${item.product.name.slice(0, 15)}...`
                    : item.product.name}
                </h5>
                <img
                  className="f-width-xs f-height-xs"
                  src={`${item.product.thumbnail}`}
                  alt={item.product.name}
                />
                <h4>
                  {Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  }).format(item.product.price)}
                </h4>
              </div>
              {/*<div className="flex box-xxl a-center j-center">
                <h4>
                  {Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  }).format(item.product.price)}
                </h4>
              </div>*/}
              <div className="flex box-xxl a-center j-center">
                <h4>{item.quantity}</h4>
              </div>
              <div className="flex box-xxl a-center j-center">
                <h4>
                  {Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  }).format(item.product.price * item.quantity)}
                </h4>
              </div>
            </div>
          ))}
      </div>

      <div className="flex box-xxl m-height-xxs column a-end j-center padding-t-xs padding-b-xs margin-l-xs margin-r-xs base-border-b">
        <h4 className="padding-l-s padding-r-s">
          Subtotal:{" "}
          {order &&
            Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(order.subtotal)}
        </h4>
        <h4 className="padding-l-s padding-r-s">
          Shipment:{" "}
          {order &&
            Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(order.deliveryCost)}
        </h4>
        {order && order.discount > 0 && (
          <h4 className="padding-l-s padding-r-s">
            Discount:{" "}
            {order &&
              Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
              }).format(order.discount)}
          </h4>
        )}
        <h4 className="padding-l-s padding-r-s">
          Total:{" "}
          {order &&
            Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(order.total)}
        </h4>
      </div>

      {order?.coupon && (
        <div className="flex box-xxl m-height-xxs a-start j-space padding-t-xs padding-b-xs margin-l-xs margin-r-xs base-border-b">
          <h3 className="padding-l-s padding-r-s">
            Coupon code: {order?.coupon.coupon.code || ""}
          </h3>
          {order?.coupon?.coupon.code && (
            <h3>
              {order?.coupon.coupon.discount_type === "value" &&
                `Discount: -${Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                }).format(order?.coupon.coupon.discount_value)}`}
              {order?.coupon.coupon.discount_type === "percent" &&
                `Discount: ${
                  order?.coupon.coupon.discount_percent
                }%/-${Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                }).format(
                  Math.round(
                    (order?.subtotal + order?.deliveryCost) *
                      order?.coupon.coupon.discount_percent
                  ) / 100
                )}`}
              {order?.coupon.coupon.discount_type === "free_delivery" &&
                `Discount: Free delivery/-${Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                }).format(order?.deliveryCost)}`}
            </h3>
          )}
          {/*((order && order.status === "uncompleted") ||
            (order && order.status === "created")) && (
            <button className="btn-text" onClick={() => onClick()}>
              <FaTrashAlt className="icon" />
            </button>
          )*/}
        </div>
      )}

      <div className="flex box-xxl m-height-xxs column a-start j-center padding-t-xs padding-b-xs margin-l-xs margin-r-xs base-border-b">
        <h1 className="padding-l-xxs padding-r-xxs">Shipping details</h1>
      </div>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-t-xs padding-b-xs margin-l-xs margin-r-xs base-border-b">
        <h4 className="padding-l-s padding-r-s">
          Address:{" "}
          {order &&
            `${order.delivery.commune}, ${order.delivery.street}, ${order.delivery.streetNumber}`}
        </h4>
        <h4 className="padding-l-s padding-r-s">
          Shipping number:{" "}
          {order && order.delivery.shipmentNumber
            ? order.delivery.shipmentNumber
            : "To be assigned"}
        </h4>
      </div>

      {((order && order.status === "uncompleted") ||
        (order && order.status === "created")) && (
        <div className="flex box-xxl column a-center margin-l-xs margin-r-xs">
          <div className="flex box-xxl m-height-xxs column a-start padding-t-xs padding-b-xs j-center base-border-b">
            <h4 className="padding-l-s padding-r-s">
              You have not yet finalized your order, you can finalize your
              purchase at continuation.
            </h4>
          </div>
          <div className="padding-t-l">
            <Coupons />
          </div>

          <div
            className={`flex ${
              device > 1
                ? "box-xl wrap margin-t-xs margin-b-l"
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
                <h5>Recommended demo payment through Flow</h5>
              </div>

              <div className="flex box-xxl a-center j-center">
                <ResendFlow
                  setError={setError}
                  setLoading={setLoading}
                  loading={loading}
                  commerceOrder={order.code}
                  items={order.items}
                  deliveryCost={order.deliveryCost}
                  discount={order.discount}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {((order && order.status === "payed") ||
        (order && order.status === "delivered")) && (
        <div className="flex box-xxl column a-center margin-l-xs margin-r-xs">
          <div className="flex box-xxl m-height-xxs column a-start padding-t-xs padding-b-xs j-center base-border-b">
            {order.delivery.status === "created" && (
              <h4 className="padding-l-s padding-r-s">
                Order placed, we will send your product soon
              </h4>
            )}
            {order.delivery.status === "receivedForCourier" && (
              <h4 className="padding-l-s padding-r-s">
                Order received by the carrier
              </h4>
            )}
            {order.delivery.status === "inRoute" && (
              <h4 className="padding-l-s padding-r-s">
                Order en route to home
              </h4>
            )}
            {order.delivery.status === "delivered" && (
              <h4 className="padding-l-s padding-r-s">
                Order delivered to home
              </h4>
            )}
          </div>
          <div className="flex box-xxl m-height-ms wrap a-center j-center">
            <div className="flex f-width-ml a-center j-start gap-s padding-ms">
              <button className="btn-small btn-active">
                <LuPackageOpen className="zoom-in-xxl" />
              </button>
              <h4>Preparing the order</h4>
            </div>
            <div className="flex f-width-ml a-center j-start gap-s padding-ms">
              <button
                className={`btn-small ${
                  order.delivery.status !== "created" && "btn-active"
                }`}
              >
                <FiPackage className="zoom-in-xxl" />
              </button>
              <h4>Order in process</h4>
            </div>
            <div className="flex f-width-ml a-center j-start gap-s padding-ms">
              <button
                className={`btn-small ${
                  order.delivery.status !== "created" &&
                  order.delivery.status !== "receivedForCourier" &&
                  "btn-active"
                }`}
              >
                <GrDeliver className="zoom-in-xxl" />
              </button>
              <h4>Order in transit</h4>
            </div>
            <div className="flex f-width-ml a-center j-start gap-s padding-ms">
              <button
                className={`btn-small ${
                  order.delivery.status === "delivered" && "btn-active"
                }`}
              >
                <FaPersonCircleCheck className="zoom-in-xxl" />
              </button>{" "}
              <h4>Order delivered</h4>
            </div>
          </div>
        </div>
      )}

      {order?.payment?.id && (
        <div className="flex box-xxl column a-center margin-l-xs margin-r-xs">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-t-xs padding-b-xs margin-l-xs margin-r-xs base-border-b">
            <h1 className="padding-l-xxs padding-r-xxs">Payment details</h1>
          </div>

          <div className="flex box-xxl m-height-xxs column a-start j-center padding-t-xs padding-b-xs margin-l-xs margin-r-xs base-border-b">
            <h3 className="padding-l-s padding-r-s">Id: {order.payment.id}</h3>
            <h3 className="padding-l-s padding-r-s">
              Date: {formatDate(order.payment.creationDate)}
            </h3>

            <h3 className="padding-l-s padding-r-s">
              Method: {formatSlugToText(order.payment.method)}
            </h3>
            <h3 className="padding-l-s padding-r-s">
              Medium: {formatSlugToText(order.payment.media)}
            </h3>

            <h3 className="padding-l-s padding-r-s">
              Total paid:{" "}
              {Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
              }).format(order.payment.amount || 0)}
            </h3>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <Image className="f-height-xxs" src={loadingGif} alt="Loading..." />
        </div>
      )}
      {error && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <h4>{error}</h4>
        </div>
      )}
    </div>
  );
}
