"use client";
// coupons.tsx

import "./coupons.css";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import loadingGif from "../../../assets/cargando/loading2.gif";
import { postClaimCoupon } from "./api/action";
import { useAuth } from "../../../context/auth/authContext";
import { useShopcart } from "../../../context/shopcart/shopcartContext";
import { UserCouponType } from "../../../interfaces/auth/authInterface";
import { useCheckout } from "../../../context/checkout/checkoutContext";

const formatCurrency = (value: number) =>
  Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);

const getCouponUnavailableReason = (userCoupon: UserCouponType) => {
  if (userCoupon.status === "is_used") {
    return "Coupon already used";
  }

  if (userCoupon.status === "is_expired") {
    return "Coupon expired";
  }

  if (!["is_claimed", "is_applied"].includes(userCoupon.status)) {
    return "Coupon not available";
  }

  const expiresAt = userCoupon.coupon.discount_expire
    ? Date.parse(userCoupon.coupon.discount_expire)
    : null;

  if (expiresAt && !Number.isNaN(expiresAt) && expiresAt < Date.now()) {
    return "Coupon expired";
  }

  return null;
};

const getEstimatedDiscount = (
  userCoupon: UserCouponType,
  subtotal: number,
  deliveryPrice: number
) => {
  const baseTotal = subtotal + deliveryPrice;
  let discount = 0;

  if (userCoupon.coupon.discount_type === "value") {
    discount = Math.round(Number(userCoupon.coupon.discount_value) || 0);
  } else if (userCoupon.coupon.discount_type === "percent") {
    discount = Math.round(
      (baseTotal * (Number(userCoupon.coupon.discount_percent) || 0)) / 100
    );
  } else if (userCoupon.coupon.discount_type === "free_delivery") {
    discount = deliveryPrice;
  }

  return Math.max(0, Math.min(discount, baseTotal));
};

const getDiscountLabel = (
  userCoupon: UserCouponType,
  subtotal: number,
  deliveryPrice: number
) => {
  const estimatedDiscount = getEstimatedDiscount(
    userCoupon,
    subtotal,
    deliveryPrice
  );

  if (userCoupon.coupon.discount_type === "percent") {
    return `${userCoupon.coupon.discount_percent}% / -${formatCurrency(
      estimatedDiscount
    )}`;
  }

  if (userCoupon.coupon.discount_type === "free_delivery") {
    return `Free delivery / -${formatCurrency(estimatedDiscount)}`;
  }

  return `-${formatCurrency(estimatedDiscount)}`;
};

export default function Coupons() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [manualOpen, setManualOpen] = useState<boolean>(false);

  const { signOutAuthState, user, setUser } = useAuth();
  const { coupon, setCoupon, subtotal } = useShopcart();
  const { deliveryPrice } = useCheckout();

  const userCoupons = useMemo(() => user?.coupons || [], [user?.coupons]);

  const eligibleCoupons = useMemo(
    () => userCoupons.filter((userCoupon) => !getCouponUnavailableReason(userCoupon)),
    [userCoupons]
  );

  const unavailableCoupons = useMemo(
    () => userCoupons.filter((userCoupon) => getCouponUnavailableReason(userCoupon)),
    [userCoupons]
  );

  const selectedCoupon = eligibleCoupons.find(
    (userCoupon) => userCoupon.id === coupon?.id
  );

  useEffect(() => {
    if (!selectedCoupon && coupon) {
      setCoupon(undefined);
    }
  }, [coupon, selectedCoupon, setCoupon]);

  useEffect(() => {
    if (!user || eligibleCoupons.length === 0) {
      setManualOpen(true);
    }
  }, [eligibleCoupons.length, user]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleCouponSelection = (e: ChangeEvent<HTMLSelectElement>) => {
    const couponId = e.target.value;
    const nextCoupon = eligibleCoupons.find(
      (userCoupon) => userCoupon.id === couponId
    );

    setCoupon(nextCoupon);
  };

  const handleClaimCoupon = (e: FormEvent) => {
    e.preventDefault();

    const couponCode = code.trim();
    if (!couponCode) {
      setError("Enter a coupon code");
      return;
    }

    setError(null);
    setInfo(null);
    setLoading(true);

    postClaimCoupon(couponCode, signOutAuthState)
      .then((updatedUser) => {
        setUser(updatedUser);
        setCode("");
        setInfo("Coupon added");
        setLoading(false);
        setManualOpen(false);
      })
      .catch((err) => {
        setCoupon(undefined);
        setError(err);
        setLoading(false);
      });
  };

  return (
    <div className="coupon-panel flex box-xxl column a-center gap-xs">
      {loading && (
        <div className="coupon-alert coupon-alert--loading flex box-xxl m-height-xxs column a-center j-center padding-xxs">
          <Image className="f-height-xxs" src={loadingGif} alt="Loading..." />
        </div>
      )}
      {error && (
        <div
          className="coupon-alert coupon-alert--error flex box-xxl m-height-xxs column a-center j-center padding-xxs"
          role="alert"
        >
          <h4>{error}</h4>
        </div>
      )}
      {info && (
        <div className="coupon-alert coupon-alert--info flex box-xxl m-height-xxs column a-center j-center padding-xxs" role="status">
          <h4>{info}</h4>
        </div>
      )}

      <div className="coupon-panel__body flex box-xxl column gap-s">
        <div className="coupon-panel__header flex box-xxl a-center j-space">
          <h3>Your coupons</h3>
          <button
            type="button"
            form="none"
            onClick={() => setManualOpen((isOpen) => !isOpen)}
            className="coupon-panel__toggle btn-span"
          >
            {manualOpen ? "Hide code input" : "Enter code"}
          </button>
        </div>

        <div className="coupon-selector flex box-xxl column gap-xs">
          <label htmlFor="coupon-selector">
            <h4>Choose a coupon</h4>
          </label>
          <select
            id="coupon-selector"
            className="coupon-selector__select input-middle"
            value={selectedCoupon?.id || ""}
            onChange={handleCouponSelection}
          >
            <option value="">No coupon</option>
            {eligibleCoupons.map((userCoupon) => (
              <option key={userCoupon.id} value={userCoupon.id}>
                {userCoupon.coupon.code} -{" "}
                {getDiscountLabel(userCoupon, subtotal, deliveryPrice)}
              </option>
            ))}
          </select>

          {selectedCoupon ? (
            <div className="coupon-card coupon-card--selected flex box-xxl column gap-xs padding-xxs">
              <h4>Selected coupon: {selectedCoupon.coupon.code}</h4>
              <h4>
                Estimated discount:{" "}
                {getDiscountLabel(selectedCoupon, subtotal, deliveryPrice)}
              </h4>
            </div>
          ) : (
            <div className="coupon-card flex box-xxl column gap-xs padding-xxs">
              <h4>No coupon selected</h4>
              {eligibleCoupons.length === 0 && (
                <h4>No eligible coupons available</h4>
              )}
            </div>
          )}
        </div>

        {unavailableCoupons.length > 0 && (
          <div className="coupon-unavailable flex box-xxl column gap-xs">
            <h4>Unavailable coupons</h4>
            {unavailableCoupons.map((userCoupon) => (
              <div
                className="coupon-unavailable__item flex box-xxl gap-s j-space a-center padding-xxs"
                key={userCoupon.id}
              >
                <h4>{userCoupon.coupon.code}</h4>
                <h4>{getCouponUnavailableReason(userCoupon)}</h4>
              </div>
            ))}
          </div>
        )}
      </div>

      {manualOpen && (
        <form
          id="coupon-form"
          action={"#"}
          encType="multipart/form-data"
          className="coupon-form flex box-xxl column a-center gap-s"
          onSubmit={(e) => handleClaimCoupon(e)}
        >
          <h4>Do you have a promotional code?</h4>
          <input
            className="coupon-form__input input-middle"
            type="text"
            id="coupon"
            name="coupon"
            onChange={(e) => onChange(e)}
            value={code}
            placeholder="Ingresa el código de descuento"
          />

          <div className="flex box-xxl gap-s j-center">
            {eligibleCoupons.length > 0 && (
              <button
                type="button"
                form="none"
                onClick={() => setManualOpen(false)}
                className="btn-span"
              >
                <h5>Cancel</h5>
              </button>
            )}
            <button form="coupon-form" className="btn-span" disabled={loading}>
              <h5>Claim coupon</h5>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
