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
  }, [
    setCheckoutStatus,
    setDeliveryPrice,
    setSelectedAddress,
    setSelectedCourier,
  ]);

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
  }, [selectedAddress, setSelectedAddress, user]);

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
  }, [
    courierServiceOptions,
    items,
    selectedAddress,
    selectedCourier,
    signOutAuthState,
  ]);

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
              <h4>Direccion</h4>
            </div>
            <div className="flex box-xxl a-center j-start padding-s">
              <h4>Acciones</h4>
            </div>
          </div>

          {user.addresses.map((address, index) => (
            <div key={index}>
              {address.isDefault && (
                <div className="selected-address__row flex box-xxl base-border-b">
                  <div className="flex box-xxl column padding-s gap-xxs base-border-r">
                    <h4>
                      Direccion: {address.countyName}, {address.streetName},{" "}
                      {address.streetNumber}, {address.regionName}
                    </h4>
                    <h4>Telefono: {address.phoneNumber}</h4>
                    {address.comment && address.comment && (
                      <h4>Comentario: {address.comment}</h4>
                    )}
                  </div>

                  <div className="flex box-xxl a-center j-center padding-s">
                    <button
                      className="btn-small"
                      onClick={() => changeAddress()}
                      type="button"
                      aria-label="Cambiar direccion seleccionada"
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
                alt="Cargando..."
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
                  <h1>Selecciona un metodo de despacho</h1>
                </div>
                <div className="flex box-xxl a-center j-space base-border-b">
                  <div className="flex box-xxl a-center j-start padding-s base-border-r">
                    <h4>Detalle</h4>
                  </div>
                  <div className="flex box-xxl a-center j-start padding-s base-border-r">
                    <h4>Valor</h4>
                  </div>
                  <div className="flex box-xxl a-center j-start padding-s">
                    <h4>Seleccionar</h4>
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
                      Empresa a cargo:{" "}
                      {formatMayusName(courier.original_courier)}
                    </h4>
                    <h4>
                      Entrega estimada: {courier.name}, en {courier.days} -{" "}
                      {courier.days + 1} dias habiles
                    </h4>
                    <h4>Tipo: {formatMayusName(courier.service_type)}</h4>
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
                      aria-label={`Seleccionar envio ${formatMayusName(
                        courier.original_courier
                      )}`}
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
          <h4>No tienes direcciones agregadas</h4>
          <button
            onClick={() => setStatus("add")}
            className="btn-middle btn-active"
            type="button"
          >
            <h4>Agregar</h4>
          </button>
        </div>
      )}
    </>
  );
}
