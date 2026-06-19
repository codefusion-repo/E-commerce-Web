// `components/checkout/delivery/addressEditor/api/action.ts`

import axios from "axios";
import { postJWTAccessTokenInPage } from "../../../../../context/auth/api/action";
import { clientApiUrl } from "../../../../../utils/api";

// Función para editar una dirección
export const postAddressEditor = (
  id: string,
  regionName: string,
  regionCode: string,
  countyName: string,
  countyCode: string,
  streetName: string,
  streetNumber: string,

  postalCode: string,
  lat: number,
  lng: number,

  phoneNumber: string,
  comment: string,
  isDefault: boolean,

  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    postJWTAccessTokenInPage()
      .then((token) => {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${token}`,
          },
        };

        const addressEditorFormData = new FormData();
        addressEditorFormData.append("id", id);
        addressEditorFormData.append("regionName", regionName);
        addressEditorFormData.append("regionCode", regionCode);
        addressEditorFormData.append("countyName", countyName);
        addressEditorFormData.append("countyCode", countyCode);
        addressEditorFormData.append("streetName", streetName);
        addressEditorFormData.append("streetNumber", streetNumber);
        addressEditorFormData.append("postalCode", postalCode);
        addressEditorFormData.append("lat", lat.toString());
        addressEditorFormData.append("lng", lng.toString());
        addressEditorFormData.append("phoneNumber", phoneNumber);
        addressEditorFormData.append("comment", comment);
        addressEditorFormData.append("isDefault", String(isDefault));

        axios
          .post(
            clientApiUrl("/api/delivery/address/editor"),
            addressEditorFormData,
            config
          )
          .then(() => {
            return resolve();
          })
          .catch((err) => {
            return reject(
              err?.response?.data?.detail ||
                "Unexpected error, please try again"
            );
          });
      })
      .catch((err) => {
        signOutAuthState(err, true, false);
        return reject(err);
      });
  });
};
