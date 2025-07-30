"use client";
// coupons.tsx

//import "./coupons.css";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import loadingGif from "../../../assets/cargando/loading2.gif";
import { postClaimCoupon } from "./api/action";
import { useAuth } from "../../../context/auth/authContext";
import { useShopcart } from "../../../context/shopcart/shopcartContext";
import { UserCouponType } from "../../../interfaces/auth/authInterface";
import { useCheckout } from "../../../context/checkout/checkoutContext";

export default function Coupons() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");

  const { signOutAuthState, user, setUser } = useAuth();

  const { items, coupon, setCoupon, subtotal } = useShopcart();

  const [status, setStatus] = useState<string>("default");

  const { deliveryPrice } = useCheckout();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleClaimCoupon = (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setInfo(null);
    setLoading(true);

    postClaimCoupon(code, signOutAuthState)
      .then((user) => {
        console.log("user: ", user);
        setUser(user);
        setLoading(false);
        setStatus("default");
      })
      .catch((err) => {
        setCoupon(undefined);
        setError(err);
        setLoading(false);
      });
  };

  const handleClaimedCoupon = (user_coupon: UserCouponType | undefined) => {
    if (user_coupon?.coupon.code == coupon?.coupon.code) {
      setCoupon(undefined);
    } else {
      setCoupon(user_coupon);
    }
  };
  useEffect(() => {
    console.log("user_coupons: ", user?.coupons.length);

    if (user && user?.coupons.length > 0) {
      setStatus("default");
    } else {
      setStatus("add");
    }
  }, [user]);

  /*const handleApplyCoupon = (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setInfo(null);
    setLoading(true);

    postApplyCoupon(code, signOutAuthState)
      .then((coupon) => {
        setInfo("Coupon applied");

        // updateItemsFirebase(items ? items : [], cartId ? cartId : "", coupon);
        setCoupon(coupon);
        setLoading(false);
      })
      .catch((err) => {
        setCoupon(undefined);
        setDiscount(0);
        setError(err);
        setLoading(false);
      });
  };

  const handleUnapplyCoupon = (code: string) => {
    setError(null);
    setInfo(null);
    setLoading(true);

    postUnpplyCoupon(code, signOutAuthState)
      .then(() => {
        setInfo("Coupon not applied");

        updateItemsFirebase(
          items ? items : [],
          cartId ? cartId : "",
          undefined
        );
        setDiscount(0);
        setCoupon(undefined);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };*/
  return (
    <div className="flex box-xxl column a-center gap-xs ">
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
      {info && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <h4>{info}</h4>
        </div>
      )}

      {user && user.coupons && status == "default" ? (
        <div className="flex box-xxl column gap-s">
          <div className="flex box-xxl a-center j-space">
            <h3>Your coupons</h3>
            <button onClick={() => setStatus("add")} className="box-s btn-span">
              Add coupon
            </button>
          </div>
          <div className="flex box-xxl f-height-ms column gap-xs auto">
            {user &&
              user.coupons.map((c, index) => (
                <button
                  className="cursor-pointer flex box-xxl gap-s j-space a-center"
                  onClick={() => handleClaimedCoupon(c)}
                  key={index}
                >
                  <h4>Code: {c.coupon.code}</h4>
                  <h4>
                    {c.coupon.discount_type === "value" &&
                      `Discount: -${Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      }).format(c.coupon.discount_value)}`}
                    {c.coupon.discount_type === "percent" &&
                      `Discount: ${
                        c.coupon.discount_percent
                      }%/-${Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      }).format(
                        Math.round(
                          (subtotal + deliveryPrice) * c.coupon.discount_percent
                        ) / 100
                      )}`}
                    {c.coupon.discount_type === "free_delivery" &&
                      `Discount: Free delivery/-${Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      }).format(deliveryPrice)}`}
                  </h4>
                  <div className="checkbox">
                    {c.coupon.code == coupon?.coupon.code ? (
                      <div className={"checkbox-center-active"}></div>
                    ) : (
                      <div className={"checkbox-center"}></div>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>
      ) : (
        <div></div>
      )}

      {status == "add" && (
        <form
          id="coupon-form"
          action={"#"}
          encType="multipart/form-data"
          className="flex box-xxl column a-center gap-s"
          onSubmit={(e) => handleClaimCoupon(e)}
        >
          <h4>Do you have a promotional code?</h4>
          <input
            className="input-middle"
            type="text"
            id="coupon"
            name="coupon"
            onChange={(e) => onChange(e)}
            value={code}
            placeholder="Ingresa el código de descuento"
          />

          <div className="flex box-xxl gap-s j-center">
            {user && user?.coupons.length > 0 && (
              <button
                form="none"
                onClick={() => setStatus("default")}
                className="btn-span"
              >
                <h5>Cancel</h5>
              </button>
            )}
            <button form="coupon-form" className="btn-span">
              <h5>Claim coupon</h5>
            </button>
          </div>
        </form>
      )}

      {/*!coupon?.coupon.code ? (
        <></>
      ) : (
        <div className="flex box-xxl column a-center gap-s">
          <h3>Code: {coupon.coupon.code}</h3>
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
                    (subtotal + deliveryPrice) * coupon.coupon.discount_percent
                  ) / 100
                )}`}
              {coupon.coupon.discount_type === "free_delivery" &&
                `Discount: Free delivery/-${Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                }).format(deliveryPrice)}`}
            </h3>
          )}
          <button
            form="coupon-form"
            className="btn-span"
            onClick={() => handleClaimedCoupon(undefined)}
          >
            <h5>Delete coupon</h5>
          </button>
        </div>
      )*/}
    </div>
  );
}
