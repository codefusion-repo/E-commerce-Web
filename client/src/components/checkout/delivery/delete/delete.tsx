"use client";
// delete.tsx

//import "./removeAddress.css";
import { useAuth } from "../../../../context/auth/authContext";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import { MdArrowBack } from "react-icons/md";
import { postDeleteAddress } from "./api/action";
import { FaRegTrashAlt } from "react-icons/fa";
import { getProfile } from "../../../../components/profile/profileEditor/api/action";
import { AddressType } from "../../../../interfaces/auth/authInterface";

export default function Delete({
  setStatus,
  address,
}: {
  setStatus: Dispatch<SetStateAction<string | undefined>>;
  address: AddressType;
}) {
  const { setUser, signOutAuthState } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const clickRemoveButton = (id: string) => {
    setLoading(true);
    setError(null);

    postDeleteAddress(id, signOutAuthState)
      .then(() => {
        getProfile(signOutAuthState)
          .then((res) => {
            setUser(res.data.user);
            setStatus("default");
            setLoading(false);
          })
          .catch((err) => {
            setError(err);
            setStatus("default");
            setLoading(false);
          });
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
        <h1>¿Seguro que quieres eliminar esta dirección?</h1>
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
      <div className="flex box-xxl column gap-xs padding-s">
        <h4>
          Dirección: {address.streetName}, {address.streetNumber},{" "}
          {address.postalCode} {address.countyName}, {address.regionName}
        </h4>
        <h4>Teléfono: {address.phoneNumber}</h4>
        {address.comment && address.comment && (
          <div>
            <h4>Comentario: {address.comment}</h4>
          </div>
        )}
      </div>

      <div className="flex box-xxl a-center j-center gap-m padding-xxs margin-t-xxs">
        <button
          className="btn-middle gap-middle"
          form="none"
          disabled={loading}
          onClick={() => setStatus("default")}
        >
          <MdArrowBack className="icon" />
          <h4>Volver</h4>
        </button>
        <button
          className="btn-middle btn-active gap-middle"
          onClick={() => clickRemoveButton(address ? address.id : "")}
        >
          <h4>Eliminar</h4>
          <FaRegTrashAlt className="icon" />
        </button>
      </div>
    </>
  );
}
