"use client";
// selected.tsx

import "./selectedAddress.css";
import { useAuth } from "../../../../context/auth/authContext";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import Image from "next/image";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import { postDeliveryCotization } from "../api/action";
import { UserType } from "../../../../interfaces/auth/authInterface";
import { ProductType } from "../../../../interfaces/shop/shopInterface";
import { useShopcart } from "../../../../context/shopcart/shopcartContext";
import { useCheckout } from "../../../../context/checkout/checkoutContext";
import { useMobile } from "../../../../context/mobile/mobileContext";

export default function Selected({
  setStatus,
}: {
  setStatus: Dispatch<SetStateAction<string | undefined>>;
}) {
  const { device } = useMobile();
  const { user, signOutAuthState } = useAuth();
  const { items } = useShopcart();
  const {
    selectedAddress,
    setSelectedAddress,
    selectedCourier,
    setSelectedCourier,
    setDeliveryPrice,
    setCheckoutStatus,
  } = useCheckout();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [courierServiceOptions, setCourierServiceOptions] = useState<
    any | undefined
  >(undefined);

  useEffect(() => {
    setSelectedAddress(undefined);
    setSelectedCourier(undefined);
    setDeliveryPrice(0);
    setCheckoutStatus(1);
  }, []);

  useEffect(() => {
    const getSelectedAddres = (user: UserType) => {
      user.addresses.forEach((address) => {
        if (address.isDefault) {
          setSelectedAddress(address);
        }
      });
    };
    if (!selectedAddress && user) {
      getSelectedAddres(user);
    }
  }, [selectedAddress]);

  const changeAddress = () => {
    setSelectedAddress(undefined);
    setSelectedCourier(undefined);
    setDeliveryPrice(0);
    setStatus("default");
  };

  useEffect(() => {
    const getCourierServiceOptions = (items: ProductType[]) => {
      setLoading(true);
      setError(null);

      postDeliveryCotization(
        items,
        signOutAuthState,
        selectedAddress?.countyCode,
        selectedAddress?.countyName
      )
        .then((res) => {
          setCourierServiceOptions(res);
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    };
    if (
      selectedAddress &&
      !selectedCourier &&
      !courierServiceOptions &&
      items
    ) {
      getCourierServiceOptions(items);
    }
  }, [selectedAddress, selectedCourier, courierServiceOptions, items]);

  const onChangeSelectedCourier = (courier: any) => {
    setDeliveryPrice(parseFloat(courier.price));
    setSelectedCourier(courier);
  };

  const formatMayusName = (texto: string) => {
    texto = texto.toString().trim();
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  return (
    <>
      {user && user.addresses?.length > 0 ? (
        <div className="selected-address flex box-xxl column">
          <div className="selected-address__columns flex box-xxl a-center j-space base-border-b">
            <div className="flex box-xxl a-center j-start padding-s base-border-r">
              <h4>Address</h4>
            </div>
            <div className="flex box-xxl a-center j-start padding-s">
              <h4>Actions</h4>
            </div>
          </div>

          {user.addresses.map((address, index) => (
            <div key={index}>
              {address.isDefault && (
                <div className="selected-address__row flex box-xxl base-border-b">
                  <div className="flex box-xxl column padding-s gap-xxs base-border-r">
                    <h4>
                      Address: {address.countyName}, {address.streetName},{" "}
                      {address.streetNumber}, {address.regionName}
                    </h4>
                    <h4>Number: {address.phoneNumber}</h4>
                    {address.comment && address.comment && (
                      <h4>Comment: {address.comment}</h4>
                    )}
                  </div>

                  <div className="flex box-xxl a-center j-center padding-s">
                    <button
                      className="btn-small"
                      onClick={() => changeAddress()}
                      type="button"
                      aria-label="Change selected address"
                    >
                      <FaEdit
                        className={`${
                          device > 1 ? "zoom-out-xxl" : "zoom-out-m"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
              <Image
                className="f-height-xxs"
                src={loadingGif}
                alt="Loading..."
              />
            </div>
          )}
          {error && (
            <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
              <h4>{error}</h4>
            </div>
          )}
          <div className="flex box-xxl column">
            {courierServiceOptions && (
              <>
                <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
                  <h1>Select a shipping method</h1>
                </div>
                <div className="flex box-xxl a-center j-space base-border-b">
                  <div className="flex box-xxl a-center j-start padding-s base-border-r">
                    <h4>Details</h4>
                  </div>
                  <div className="flex box-xxl a-center j-start padding-s base-border-r">
                    <h4>Value</h4>
                  </div>
                  <div className="flex box-xxl a-center j-start padding-s">
                    <h4>Select</h4>
                  </div>
                </div>
              </>
            )}
            {courierServiceOptions &&
              courierServiceOptions.map((courier: any, index: number) => (
                <div
                  key={index}
                  className={`courier-option flex box-xxl ${
                    index + 1 != courierServiceOptions.length
                      ? "border-bottom"
                      : ""
                  } ${
                    selectedCourier &&
                    selectedCourier.original_courier === courier.original_courier
                      ? "courier-option--selected"
                      : ""
                  }`}
                >
                  <div className="flex box-xxl column padding-s gap-xxs">
                    <h4>
                      Company in charge:{" "}
                      {formatMayusName(courier.original_courier)}
                    </h4>
                    <h4>
                      Estimated delivery: {courier.name}, on {courier.days} -{" "}
                      {courier.days + 1} working days
                    </h4>
                    <h4>Type: {formatMayusName(courier.service_type)}</h4>
                  </div>
                  <div className="flex box-xxl a-center j-center padding-s gap-xxs">
                    <h3>
                      {Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      }).format(courier.price)}
                    </h3>
                  </div>
                  <div className="flex box-xxl a-center j-center padding-s gap-xxs">
                    <button
                      form="none"
                      onClick={() => onChangeSelectedCourier(courier)}
                      className="checkbox"
                      type="button"
                      aria-label={`Select ${formatMayusName(
                        courier.original_courier
                      )} shipping`}
                    >
                      {selectedCourier &&
                      selectedCourier.original_courier ===
                        courier.original_courier ? (
                        <div className={"checkbox-center-active"}></div>
                      ) : (
                        <div className={"checkbox-center"}></div>
                      )}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="flex box-xxl column padding-s gap-s">
          <h4>You have no addresses added</h4>
          <button
            onClick={() => setStatus("add")}
            className="btn-middle btn-active"
            type="button"
          >
            <h4>Add</h4>
          </button>
        </div>
      )}
    </>
  );
}
