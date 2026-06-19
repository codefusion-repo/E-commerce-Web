"use client";
// checkout.tsx

import "./checkout.css";
import CheckoutNavbar from "./navbar/navbar";
import { useMessages } from "../../context/messages/messagesContext";
import { usePathname, useRouter } from "next/navigation";
import Coupons from "./coupons/coupons";
import Link from "next/link";
import { useAuth } from "../../context/auth/authContext";
import { useModal } from "../../context/modal/modalContext";
import { useEffect } from "react";
import { useShopcart } from "../../context/shopcart/shopcartContext";
import { useCheckout } from "../../context/checkout/checkoutContext";
import { useMobile } from "../../context/mobile/mobileContext";

export default function Checkout({ children }: { children: React.ReactNode }) {
  const { device } = useMobile();
  const { isAuthenticated } = useAuth();
  const { openModal } = useModal();

  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/shopcart");
      openModal("login", "You must be authenticated to continue");
    }
  }, [isAuthenticated]);

  const { items, subtotal, total, coupon } = useShopcart();

  const { deliveryPrice, selectedAddress, selectedCourier, checkoutStatus } =
    useCheckout();

  const { addMessage } = useMessages();

  const pathname = usePathname();
  const getStepClass = (step: number) => {
    if (checkoutStatus > step) {
      return "checkout-step checkout-step--complete";
    }

    if (checkoutStatus === step) {
      return "checkout-step checkout-step--active";
    }

    return "checkout-step";
  };

  return (
    <div className="checkout-page flex box-xxl column a-center j-center navbar-p-s">
      <CheckoutNavbar />
      <div
        className={`checkout-steps flex ${
          device > 3
            ? "box-xl f-height-s"
            : device < 3
            ? "box-xxl-m column m-height-s"
            : "box-xxl-m f-height-s"
        } a-center j-space`}
        aria-label="Checkout progress"
      >
        <div
          className={`${getStepClass(0)} flex ${
            device > 2 ? "f-height-s" : "m-height-xs"
          } box-xxl a-center j-start padding-xs`}
          aria-current={checkoutStatus === 0 ? "step" : undefined}
        >
          <div className="checkout-step__marker">1</div>
          <div>
            <h2>Address</h2>
            <h3>Select your shipping address</h3>
          </div>
        </div>
        <div
          className={`${getStepClass(1)} flex ${
            device > 2 ? "f-height-s" : "m-height-xs"
          } box-xxl a-center j-start padding-xs`}
          aria-current={checkoutStatus === 1 ? "step" : undefined}
        >
          <div className="checkout-step__marker">2</div>
          <div>
            <h2>Shipping Method</h2>
            <h3>Select a shipping method</h3>
          </div>
        </div>
        <div
          className={`${getStepClass(2)} flex ${
            device > 2 ? "f-height-s" : "m-height-xs"
          } box-xxl a-center j-start padding-xs`}
          aria-current={checkoutStatus === 2 ? "step" : undefined}
        >
          <div className="checkout-step__marker">3</div>
          <div>
            <h2>Payment</h2>
            <h3>Finish your purchase</h3>
          </div>
        </div>
      </div>
      <div
        className={`checkout-shell flex ${
          device > 3 ? "box-xl" : device < 3 ? "box-xxl-m column" : "box-xxl-m"
        } m-height-m wrap padding-s margin-b-xxl`}
      >
        <div className="checkout-shell__header flex box-xxl m-height-xxs column a-start j-center padding-xs">
          <span>Secure checkout</span>
          {pathname.includes("/delivery") && <h1>Shipping address</h1>}
          {pathname.includes("/payment") && <h1>Payment method</h1>}
        </div>
        <div
          className={`checkout-shell__main flex ${
            device > 2 ? "box-l padding-r-s" : "box-xxl"
          } padding-b-s`}
        >
          {children}
        </div>

        <div
          className={`checkout-summary flex column ${
            device > 2 ? "box-s" : "box-xxl"
          } j-space gap-l padding-t-l padding-b-l padding-r-s padding-l-s`}
        >
          <div className="checkout-summary__nav flex box-xxl column a-center gap-m">
            {pathname.includes("/delivery") && (
              <Link href={"/shopcart"} className="btn-middle">
                <h4>Shopping cart</h4>
              </Link>
            )}
            {pathname.includes("/payment") && (
              <Link href={"/checkout/delivery"} className="btn-middle">
                <h4>Shipping address</h4>
              </Link>
            )}
            {pathname.includes("/delivery") && (
              <button
                onClick={
                  selectedAddress && selectedCourier
                    ? () => router.push("/checkout/payment")
                    : () => addMessage("Select a shipping method")
                }
                disabled={selectedAddress && selectedCourier ? false : true}
                className={`btn-middle ${
                  selectedAddress && selectedCourier && "btn-active"
                }`}
                type="button"
              >
                <h4>Continue</h4>
              </button>
            )}
          </div>
          <div className="checkout-summary__products flex box-xxl column a-center gap-xs">
            <h3>Products</h3>
            <div
              className={`flex box-xxl column ${
                device > 2 ? "a-start" : "a-center"
              }`}
            >
              {items &&
                items.map((item) => (
                  <div key={item.id} className="margin-b-xxs">
                    <h4>
                      *{" "}
                      {item.name.length > 20
                        ? `${item.name.slice(0, 19)}`
                        : item.name}{" "}
                      x {item.quantity} ={" "}
                      {Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      }).format(item.price * item.quantity)}
                    </h4>
                  </div>
                ))}
            </div>
          </div>

          <Coupons />
        </div>
        <div
          className={`checkout-totals flex ${
            device > 2 ? "j-space" : "column"
          } box-xxl a-end padding-xs`}
        >
          <h3>
            {items && items.length > 1
              ? `You have ${
                  items && items.length
                } products in your shopping cart`
              : items && items.length === 0
              ? `There are no products in your shopping cart`
              : `You have ${
                  items && items.length
                } product in your shopping cart`}
          </h3>
          <h3>
            Subtotal:{" "}
            {Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(subtotal && subtotal)}
          </h3>
          <h3>
            Delivery cost:{" "}
            {Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(deliveryPrice && deliveryPrice)}
          </h3>
          {coupon?.coupon.code && (
            <h3>
              {coupon.coupon.discount_type === "value" &&
                `Discount: -${Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                }).format(coupon.coupon.discount_value)}`}
              {coupon.coupon.discount_type === "percent" &&
                `Discount: ${
                  coupon.coupon.discount_percent
                }%/-${Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                }).format(
                  Math.round(
                    ((subtotal + deliveryPrice) *
                      coupon.coupon.discount_percent) /
                      100
                  )
                )}`}
              {coupon.coupon.discount_type === "free_delivery" &&
                `Discount: Free delivery/-${Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                }).format(deliveryPrice)}`}
            </h3>
          )}
          <h3>
            Total:{" "}
            {Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(total && total)}
          </h3>
        </div>
      </div>
    </div>
  );
}
