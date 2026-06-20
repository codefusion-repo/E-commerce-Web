"use client";
// default.tsx

import "./defaultAddress.css";
import { useAuth } from "../../../../context/auth/authContext";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FaRegTrashAlt, FaEdit } from "react-icons/fa";
import { setDefaultAddress } from "./api/action";
import Image from "next/image";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import { getProfile } from "../../../../components/profile/profileEditor/api/action";
import { AddressType } from "../../../../interfaces/auth/authInterface";
import { useCheckout } from "../../../../context/checkout/checkoutContext";
import { useMobile } from "../../../../context/mobile/mobileContext";
import { usePathname } from "next/navigation";

export default function Default({
  setStatus,
  setAddress,
}: {
  setStatus: Dispatch<SetStateAction<string | undefined>>;
  setAddress: Dispatch<SetStateAction<AddressType | undefined>>;
}) {
  const { device } = useMobile();
  const { user, setUser, signOutAuthState } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { setCheckoutStatus } = useCheckout();

  const pathname = usePathname();

  useEffect(() => {
    setCheckoutStatus(0);
  }, [setCheckoutStatus]);

  const selectedAddress = () => {
    let isDefault: boolean = false;
    user?.addresses.forEach((address) => {
      if (address.isDefault) {
        isDefault = true;
      }
    });

    if (isDefault) {
      setStatus("selected");
    } else {
      setError("Selecciona una direccion");
    }
  };

  const onChangeDefaultAddress = (id: string) => {
    setError(null);
    setInfo(null);
    setLoading(true);

    setDefaultAddress(id, signOutAuthState)
      .then((detail) => {
        getProfile(signOutAuthState)
          .then((res) => {
            setUser(res.data.user);
            setInfo(detail);
            setLoading(false);
          })
          .catch((err) => {
            setError(err);
            setLoading(false);
          });
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  const handleAddresEditor = (address: AddressType) => {
    setAddress(address);
    setStatus("edit");
  };
  const handleRemoveAddress = (address: AddressType) => {
    setAddress(address);
    setStatus("delete");
  };

  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
        <h1>Direcciones</h1>
      </div>
      {loading && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <Image className="f-height-xxs" src={loadingGif} alt="Cargando..." />
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

      {user && user.addresses?.length > 0 ? (
        <div className="default-address flex box-xxl column">
          <div className="default-address__columns flex box-xxl a-center j-space base-border-b">
            <div className="flex box-xxl a-center j-start padding-s base-border-r">
              <h4>Direccion</h4>
            </div>
            <div className="flex box-xxl a-center j-start padding-s base-border-r">
              <h4>Predeterminada</h4>
            </div>
            <div className="flex box-xxl a-center j-start padding-s">
              <h4>Acciones</h4>
            </div>
          </div>

          {user.addresses.map((address, index) => (
            <div
              key={index}
              className={`default-address__row flex box-xxl ${
                index + 1 != user.addresses.length ? "base-border-b" : ""
              } ${address.isDefault ? "default-address__row--selected" : ""}`}
            >
              <div className="flex box-xxl column padding-s gap-xxs">
                <h4>
                  Direccion: {address.streetName}, {address.streetNumber},{" "}
                  {address.postalCode} {address.countyName},{" "}
                  {address.regionName}
                </h4>
                <h4>Telefono: {address.phoneNumber}</h4>
                {address.comment && address.comment && (
                  <div>
                    <h4>Comentario: {address.comment}</h4>
                  </div>
                )}
              </div>

              <div className="flex box-xxl a-center j-center padding-s gap-xxs">
                <button
                  form="none"
                  onClick={() => onChangeDefaultAddress(address.id)}
                  className="checkbox"
                  type="button"
                  aria-label={`Marcar ${address.streetName} como direccion predeterminada`}
                >
                  {address.isDefault ? (
                    <div className={"checkbox-center-active"}></div>
                  ) : (
                    <div className={"checkbox-center"}></div>
                  )}
                </button>
              </div>

              <div
                className={`flex box-xxl ${
                  device > 0 ? "gap-l" : "column gap-s"
                } a-center j-center padding-s`}
              >
                <button
                  className="btn-small"
                  onClick={() => handleRemoveAddress(address)}
                  type="button"
                  aria-label={`Eliminar ${address.streetName}`}
                >
                  <FaRegTrashAlt
                    className={`${device > 1 ? "zoom-out-xxl" : "zoom-out-m"}`}
                  />
                </button>
                <button
                  className="btn-small"
                  onClick={() => handleAddresEditor(address)}
                  type="button"
                  aria-label={`Editar ${address.streetName}`}
                >
                  <FaEdit
                    className={`${device > 1 ? "zoom-out-xxl" : "zoom-out-m"}`}
                  />
                </button>
              </div>
            </div>
          ))}

          <div className="flex box-xxl a-center j-center gap-m padding-xxs margin-t-xxs">
            {user.addresses.length < 3 && (
              <button
                onClick={() => setStatus("add")}
                className="btn-middle"
                type="button"
              >
                <h4>Agregar</h4>
              </button>
            )}
            {pathname.includes("/checkout") && (
              <button
                disabled={loading}
                className="btn-middle btn-active"
                onClick={() => selectedAddress()}
                type="button"
              >
                <h4>Continuar</h4>
              </button>
            )}
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
