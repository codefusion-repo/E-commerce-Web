"use client";
// coupons.tsx

//import "./coupons.css";
import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";
import loadingGif from "../../../assets/cargando/loading2.gif";
import { postApplyCoupon, postUnpplyCoupon } from "./api/action";
import { useAuth } from "../../../context/auth/authContext";
import { useShopcart } from "../../../context/shopcart/shopcartContext";

export default function Coupons() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");

  const { signOutAuthState } = useAuth();

  const {
    cartId,
    items,
    updateItemsFirebase,
    coupon,
    setCoupon,
    discount,
    setDiscount,
  } = useShopcart();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleApplyCoupon = (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setInfo(null);
    setLoading(true);

    postApplyCoupon(code, signOutAuthState)
      .then((coupon) => {
        setInfo("Coupon applied");

        updateItemsFirebase(items ? items : [], cartId ? cartId : "", coupon);
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
  };
  return (
    <div className="flex box-xxl column a-center gap-xs">
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
      {!coupon?.code ? (
        <form
          id="coupon-form"
          action={"#"}
          encType="multipart/form-data"
          className="flex box-xxl column a-center gap-s"
          onSubmit={(e) => handleApplyCoupon(e)}
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
          <button form="coupon-form" className="btn-span">
            <h5>Apply coupon</h5>
          </button>
        </form>
      ) : (
        <div className="flex box-xxl column a-center gap-s">
          <h3>Code: {coupon.code}</h3>
          <h3>
            Discount:{" "}
            {Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(discount && discount)}{" "}
          </h3>
          <button
            form="coupon-form"
            className="btn-span"
            onClick={() => handleUnapplyCoupon(coupon.code)}
          >
            <h5>Delete coupon</h5>
          </button>
        </div>
      )}
    </div>
  );
}
