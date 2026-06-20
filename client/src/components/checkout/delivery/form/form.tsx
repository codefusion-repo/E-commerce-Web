"use client";
// form.tsx

import { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { MdArrowBack } from "react-icons/md";
import PhoneInput from "react-phone-number-input";
import { useAuth } from "../../../../context/auth/authContext";
import {
  E164Number,
  RegionType,
} from "../../../../interfaces/utils/utilsInterface";
import { useMobile } from "../../../../context/mobile/mobileContext";

export default function Form({
  loading,

  onSubmitValidation,

  regions,
  communes,

  selectedRegionId,
  onChangeRegion,

  selectedCommuneId,
  onChangeCommune,

  streetName,
  streetNumber,
  phoneNumber,
  comment,

  isDefault,
  isPhoneDefault,

  onChange,

  clickCheckboxIsPhoneDefault,
  clickCheckboxIsDefault,

  setStatus,
}: {
  loading: boolean;

  onSubmitValidation: (e: FormEvent<HTMLFormElement>) => void;

  regions: RegionType[];
  communes?: any[];

  selectedRegionId?: string;
  onChangeRegion: (e: ChangeEvent<HTMLSelectElement>) => void;

  selectedCommuneId?: string;
  onChangeCommune: (e: ChangeEvent<HTMLSelectElement>) => void;

  streetName: string;
  streetNumber: string;
  phoneNumber: string;
  comment: string;

  isDefault: boolean;
  isPhoneDefault: boolean;

  onChange: (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | E164Number
      | undefined
  ) => void;

  clickCheckboxIsPhoneDefault: () => void;
  clickCheckboxIsDefault: () => void;

  setStatus: Dispatch<SetStateAction<string | undefined>>;
}) {
  const { device } = useMobile();
  const { user } = useAuth();

  const formatCommunes = (texto: string) => {
    texto = texto.toString().trim();
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  return (
    <form
      onSubmit={(e) => onSubmitValidation(e)}
      id="address-form"
      encType="multipart/form-data"
      action="#"
      className={`flex box-xxl ${
        device > 0 ? "wrap" : "column"
      } a-center j-center`}
    >
      <div
        className={`flex ${
          device > 0 ? "box-m" : "box-xxl"
        } column gap-xxs padding-xs margin-b-xxs`}
      >
        <h4>Región</h4>
        <select
          className="select-large"
          disabled={loading}
          id="region"
          name="region"
          value={selectedRegionId}
          onChange={(e) => onChangeRegion(e)}
        >
          <option value={undefined}>Selecciona una región</option>
          {regions &&
            regions.map((region) => (
              <option key={region.region_id} value={region.region_id}>
                {region.regionName}
              </option>
            ))}
        </select>
      </div>

      <div
        className={`flex ${
          device > 0 ? "box-m" : "box-xxl"
        } column gap-xxs padding-xs margin-b-xxs`}
      >
        <h4>Comuna</h4>
        <select
          className="select-large"
          disabled={loading}
          id="commune"
          name="commune"
          value={selectedCommuneId}
          onChange={(e) => onChangeCommune(e)}
        >
          <option value={undefined}>Selecciona una comuna</option>
          {communes &&
            communes.map((commune) => (
              <option key={commune.id} value={commune.id}>
                {formatCommunes(commune.name)}
              </option>
            ))}
        </select>
      </div>
      <div
        className={`flex ${
          device > 0 ? "box-m" : "box-xxl"
        } column gap-xxs padding-xs margin-b-xxs`}
      >
        <h4>Calle</h4>
        <input
          className="input-large"
          readOnly={loading}
          onChange={(e) => onChange(e)}
          value={streetName}
          type="text"
          name="streetName"
          id="streetName"
          placeholder="Calle"
        />
      </div>

      <div
        className={`flex ${
          device > 0 ? "box-m" : "box-xxl"
        } column gap-xxs padding-xs margin-b-xxs`}
      >
        <h4>Número</h4>
        <input
          className="input-large"
          readOnly={loading}
          onChange={(e) => onChange(e)}
          value={streetNumber}
          type="text"
          name="streetNumber"
          id="streetNumber"
          placeholder="Número"
        />
      </div>
      <div
        className={`flex ${
          device > 0 ? "box-m" : "box-xxl"
        } column gap-xxs padding-xs margin-b-xxs`}
      >
        <h4>Teléfono</h4>

        <PhoneInput
          placeholder={!isPhoneDefault ? "Ingresa un teléfono" : user?.phone}
          name="phoneNumber"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => onChange(e)}
          defaultCountry="CL"
          disabled={isPhoneDefault}
        />
      </div>

      {user && user.phone && (
        <div
          className={`flex ${
            device > 0 ? "box-m" : "box-xxl"
          } column gap-xxs padding-xs margin-b-xxs`}
        >
          <h4>¿Usar teléfono predeterminado?</h4>
          <div className="flex box-xxl a-center j-center gap-xs">
            <button
              form="none"
              onClick={() => clickCheckboxIsPhoneDefault()}
              className="checkbox"
            >
              {isPhoneDefault ? (
                <div className={"checkbox-center-active"}></div>
              ) : (
                <div className={"checkbox-center"}></div>
              )}
            </button>
            <h5>{user.phone}</h5>
          </div>
        </div>
      )}

      <div
        className={`flex ${
          device > 0 ? "box-m" : "box-xxl"
        } column gap-xxs padding-xs margin-b-xxs`}
      >
        <h4>¿Usar como dirección predeterminada?</h4>
        <div className="flex box-xxl a-center j-center gap-xs">
          <button
            form="none"
            onClick={() => clickCheckboxIsDefault()}
            className="checkbox"
          >
            {isDefault ? (
              <div className={"checkbox-center-active"}></div>
            ) : (
              <div className={"checkbox-center"}></div>
            )}
          </button>
        </div>
      </div>

      <div
        className={`${
          device > 0 ? `${user && user.phone ? "box-m" : "box-xxl"}` : "box-xxl"
        } flex column gap-xxs padding-xs margin-b-xxs`}
      >
        <h4>Agregar comentario</h4>
        <textarea
          className="input-large"
          readOnly={loading}
          onChange={(e) => onChange(e)}
          value={comment}
          name="comment"
          id="comment"
          placeholder="Agregar comentario"
        ></textarea>
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
          disabled={loading}
          className="btn-middle btn-active"
          form="address-form"
        >
          <h4>Enviar</h4>
        </button>
      </div>
    </form>
  );
}
