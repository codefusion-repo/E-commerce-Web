"use client";
// confirm.tsx

import { Dispatch, SetStateAction } from "react";
import { MdArrowBack } from "react-icons/md";
import { AdvancedMarker, APIProvider, Map } from "@vis.gl/react-google-maps";
import markerImage from "../../../../assets/pin/pin2.png";

export default function Confirm({
  loading,

  streetName,
  streetNumber,
  postalCode,
  countyName,
  regionName,

  lat,
  lng,

  setValidateStatus,
  onClickConfirm,

  onDragMarker,
}: {
  loading: boolean;

  streetName: string;
  streetNumber: string;
  postalCode: string;
  countyName: string;
  regionName: string;

  lat: number;
  lng: number;

  setValidateStatus: Dispatch<SetStateAction<string>>;
  onClickConfirm: () => void;

  onDragMarker: (e: google.maps.MapMouseEvent) => void;
}) {
  return (
    <div className="flex box-xxl column a-center j-center">
      <div className="flex box-xxl a-center j-start padding-m">
        <h3>
          {streetName} {streetNumber}, {postalCode} {countyName}, {regionName}
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
            {/*<img src={markerImage.src} className="f-width-xs f-height-xs" />*/}
          </AdvancedMarker>
        </Map>
      </APIProvider>

      <div className="flex box-xxl a-center j-end padding-m">
        <h3>
          Latitude: {lat}, Longitude: {lng}
        </h3>
      </div>

      <div className="flex box-xxl a-center j-center gap-m padding-xxs margin-t-xxs">
        <button
          className="btn-middle gap-middle"
          form="none"
          disabled={loading}
          onClick={() => setValidateStatus("default")}
        >
          <MdArrowBack className="icon" />
          <h4>Back</h4>
        </button>
        <button
          onClick={() => onClickConfirm()}
          disabled={loading}
          className="btn-middle btn-active"
        >
          <h4>Confirm</h4>
        </button>
      </div>
    </div>
  );
}
