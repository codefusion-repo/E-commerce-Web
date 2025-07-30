"use client";
// editor.tsx

import { useAuth } from "../../../../context/auth/authContext";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { postValidateAddress } from "../api/action";
import { getProfile } from "../../../../components/profile/profileEditor/api/action";
import { postAddressEditor } from "./api/action";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import Image from "next/image";
import { verifyAddressFormData } from "../add/api/action";
import Form from "../form/form";
import Confirm from "../confirm/confirm";
import allCommunes from "../coverageCommunes.json";
import { AddressType } from "../../../../interfaces/auth/authInterface";
import {
  E164Number,
  RegionType,
} from "../../../../interfaces/utils/utilsInterface";

export default function Editor({
  setStatus,
  regions,
  address,
}: {
  setStatus: Dispatch<SetStateAction<string | undefined>>;
  regions: RegionType[];
  address: AddressType;
}) {
  const { user, setUser, signOutAuthState } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  //const [regions, setRegions] = useState<any[] | undefined>(undefined);

  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>(
    address.regionCode
  );
  const [communes, setCommunes] = useState<any[] | undefined>(undefined);
  const [selectedCommuneId, setSelectedCommuneId] = useState<
    string | undefined
  >(address.countyCode);
  /*const [streets, setStreets] = useState<any[] | undefined>(undefined);
  const [selectedStreetId, setSelectedStreetId] = useState<string | undefined>(
    address?.street_id
  );
  const [streetNumbers, setStreetNumbers] = useState<any[] | undefined>(
    undefined
  );
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >(address?.address_id);*/

  const [isDefault, setIsDefault] = useState<boolean>(address.isDefault);
  const [isPhoneDefault, setIsPhoneDefault] = useState<boolean>(false);

  const [lat, setLat] = useState<number>(address.lat);
  const [lng, setLng] = useState<number>(address.lng);

  const [previousResponseId, setPreviousResponseId] = useState<string>("");

  const [validateStatus, setValidateStatus] = useState<string>("default");

  const [addressFormData, setAddressFormData] = useState({
    regionName: address.regionName,
    countyName: address.countyName,
    streetName: address.streetName,
    streetNumber: address.streetNumber,
    postalCode: address.postalCode,
    phoneNumber: address.phoneNumber,
    comment: address.comment,
  });

  const {
    regionName,
    countyName,
    streetName,
    streetNumber,
    postalCode,
    phoneNumber,
    comment,
  } = addressFormData;

  useEffect(() => {
    if (!communes) {
      const communesOfSelectedRegion = allCommunes.filter(
        (commune) => String(commune.region_id) === address.regionCode
      );

      setCommunes(communesOfSelectedRegion);
      setLoading(false);
    }
  }, [communes]);

  const onSubmitValidation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    let phone: string = "";
    if (user) {
      if (isPhoneDefault) {
        phone = user?.phone;
      } else {
        phone = phoneNumber;
      }
    }

    verifyAddressFormData(
      regionName,
      selectedRegionId,
      countyName,
      selectedCommuneId,
      streetName,
      streetNumber,
      phone
    )
      .then(() => {
        postValidateAddress(
          streetName,
          streetNumber,
          countyName,
          regionName,
          previousResponseId
        )
          .then((res) => {
            setAddressFormData({
              ...addressFormData,
              streetName: res.street,
              streetNumber: res.number,
              postalCode: res.postalCode,
            });

            setPreviousResponseId(res.preResId);
            setLat(Number(res.lat.toFixed(5)));
            setLng(Number(res.lng.toFixed(5)));

            setValidateStatus("confirm");
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

  /*const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    if (!selectedRegionId) {
      setError("Selecciona una región");
      setLoading(false);
      return;
    }
    if (!selectedCommuneId) {
      setError("Selecciona una comuna");
      setLoading(false);
      return;
    }
    if (!selectedStreetId) {
      setError("Selecciona una calle");
      setLoading(false);
      return;
    }
    if (!selectedAddressId) {
      setError("Selecciona un N° de casa");
      setLoading(false);
      return;
    }

    let phone: string = "";

    if (user) {
      if (isPhoneDefault) {
        phone = user?.phone;
      } else {
        phone = phoneNumber;
      }
    }

    postAddressEditor(
      address?.id,
      regionName,
      selectedRegionId,
      countyName,
      selectedCommuneId,
      streetName,
      selectedStreetId,
      streetNumber,
      selectedAddressId,
      phone,
      comment,
      isDefault,

      signOutAuthState
    )
      .then(() => {
        getProfile(signOutAuthState)
          .then((res) => {
            setUser(res.data.user);
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
  };*/

  const onClickConfirm = () => {
    setError(null);
    setLoading(true);

    let phone: string = "";
    if (user) {
      if (isPhoneDefault) {
        phone = user?.phone;
      } else {
        phone = phoneNumber;
      }
    }
    verifyAddressFormData(
      regionName,
      selectedRegionId,
      countyName,
      selectedCommuneId,
      streetName,
      streetNumber,
      phone
    )
      .then((res) => {
        postAddressEditor(
          address.id,
          regionName,
          res.regionCode,
          countyName,
          res.countyCode,
          streetName,
          streetNumber,

          postalCode,
          lat,
          lng,

          phone,
          comment,
          isDefault,

          signOutAuthState
        )
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
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };
  const onChangeRegion = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    let regionName = e.target.selectedOptions[0].text;
    let regionCode = e.target.value;

    setCommunes(undefined);
    setSelectedCommuneId(undefined);

    setSelectedRegionId(regionCode);

    setAddressFormData({
      ...addressFormData,
      regionName: regionName,
      countyName: "",
      streetName: "",
      streetNumber: "",
    });

    const communesOfSelectedRegion = allCommunes.filter(
      (commune) => String(commune.region_id) === regionCode
    );

    setCommunes(communesOfSelectedRegion);
    setLoading(false);

    /*getCommunesCoverage(regionCode)
      .then((res) => {
        setCommunes(res.data.coverageAreas);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });*/
  };
  const onChangeCommune = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();

    setError(null);

    let countyName = e.target.selectedOptions[0].text;
    let countyCode = e.target.value;

    setSelectedCommuneId(countyCode);

    setAddressFormData({
      ...addressFormData,
      countyName: countyName,
      streetName: "",
      streetNumber: "",
    });
  };
  const onChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | E164Number
      | undefined
  ) => {
    setError(null);

    if (typeof e === "string" || typeof e === "undefined") {
      if (typeof e === "undefined") {
        setAddressFormData({ ...addressFormData, phoneNumber: "" });
      } else {
        setAddressFormData({ ...addressFormData, phoneNumber: e });
      }
    } else if (e && e.target) {
      e.preventDefault();

      setAddressFormData({
        ...addressFormData,
        [e.target.name]: e.target.value,
      });
    }
  };
  const clickCheckboxIsDefault = () => {
    if (isDefault === true) {
      setIsDefault(false);
    } else if (isDefault === false) {
      setIsDefault(true);
    }
  };
  const clickCheckboxIsPhoneDefault = () => {
    if (isPhoneDefault === true) {
      setIsPhoneDefault(false);
    } else if (isPhoneDefault === false) {
      setIsPhoneDefault(true);
    }
  };
  const onDragMarker = (e: google.maps.MapMouseEvent) => {
    setLat(Number(e.latLng?.lat().toFixed(5)) || 0);
    setLng(Number(e.latLng?.lng().toFixed(5)) || 0);
  };

  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
        {validateStatus === "default" && <h1>Edit address</h1>}
        {validateStatus === "confirm" && (
          <h1>Confirm your address on the map</h1>
        )}
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
      {validateStatus === "default" && (
        <Form
          loading={loading}
          onSubmitValidation={onSubmitValidation}
          regions={regions}
          communes={communes}
          selectedRegionId={selectedRegionId}
          onChangeRegion={onChangeRegion}
          selectedCommuneId={selectedCommuneId}
          onChangeCommune={onChangeCommune}
          streetName={streetName}
          streetNumber={streetNumber}
          phoneNumber={phoneNumber}
          comment={comment}
          isDefault={isDefault}
          isPhoneDefault={isPhoneDefault}
          onChange={onChange}
          clickCheckboxIsPhoneDefault={clickCheckboxIsPhoneDefault}
          clickCheckboxIsDefault={clickCheckboxIsDefault}
          setStatus={setStatus}
        />
      )}
      {validateStatus === "confirm" && (
        <Confirm
          loading={loading}
          streetName={streetName}
          streetNumber={streetNumber}
          postalCode={postalCode}
          countyName={countyName}
          regionName={regionName}
          lat={lat}
          lng={lng}
          setValidateStatus={setValidateStatus}
          onClickConfirm={onClickConfirm}
          onDragMarker={onDragMarker}
        />
      )}
    </>
  );
}
