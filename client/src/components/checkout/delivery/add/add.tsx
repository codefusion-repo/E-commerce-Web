"use client";
// add.tsx

import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
} from "react";
import Image from "next/image";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import { useAuth } from "../../../../context/auth/authContext";
import { postValidateAddress } from "../api/action";
import { postAddAddress, verifyAddressFormData } from "./api/action";
import { getProfile } from "../../../../components/profile/profileEditor/api/action";
import Form from "../form/form";
import Confirm from "../confirm/confirm";
import allCommunes from "../coverageCommunes.json";
import {
  E164Number,
  RegionType,
} from "../../../../interfaces/utils/utilsInterface";

export default function Add({
  setStatus,
  regions,
}: {
  setStatus: Dispatch<SetStateAction<string | undefined>>;
  regions: RegionType[];
}) {
  const { user, setUser, signOutAuthState } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>(
    undefined
  );
  const [communes, setCommunes] = useState<any[] | undefined>(undefined);
  const [selectedCommuneId, setSelectedCommuneId] = useState<
    string | undefined
  >(undefined);

  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [isPhoneDefault, setIsPhoneDefault] = useState<boolean>(false);

  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);

  const [previousResponseId, setPreviousResponseId] = useState<string>("");

  const [validateStatus, setValidateStatus] = useState<string>("default");

  const [addressFormData, setAddressFormData] = useState({
    regionName: "",
    countyName: "",
    streetName: "",
    streetNumber: "",
    postalCode: "",
    phoneNumber: "",
    comment: "",
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
        postAddAddress(
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
        {validateStatus === "default" && <h1>Add address</h1>}
        {validateStatus === "confirm" && (
          <h1>Confirm your address on the map</h1>
        )}
      </div>
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

      {/*validateStatus === "confirm" && (
        <div className="box-xxl box-column padding-middle">
          <div className="box-xxl box-center padding-large gap-large">
            <h3>
              {streetName} {streetNumber}, {postalCode} {countyName},{" "}
              {regionName}
            </h3>
          </div>
          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS || ""}>
            <Map
              style={{ width: "100%", height: "300px" }}
              defaultCenter={{ lat: lat, lng: lng }}
              defaultZoom={18}
              gestureHandling={"greedy"}
              disableDefaultUI={true}
              mapId={process.env.NEXT_PUBLIC_MAP_ID}
            >
              <AdvancedMarker
                draggable={true}
                onDragEnd={(e) => onDragMarker(e)}
                position={{ lat: lat, lng: lng }}
              >
                <img src={markerImage.src} className="map-img" />
              </AdvancedMarker>
            </Map>
          </APIProvider>

          <div className="box-xxl box-center padding-large gap-large">
            <h3>
              Latitud: {lat}, Longitud: {lng}
            </h3>
          </div>

          <div className="box-xxl box-center padding-large gap-large">
            <button
              className="btn-middle"
              form="none"
              disabled={loading}
              onClick={() => setValidateStatus("default")}
            >
              <MdArrowBack className="icon" />
              <h4>Atras</h4>
            </button>
            <button
              onClick={() => onClickConfirm()}
              disabled={loading}
              className="btn-middle btn-active"
            >
              <h4>Confirmar</h4>
            </button>
          </div>
        </div>
      )*/}
    </>
  );
}
