// `components/checkout/delivery/addAddress/api/action.ts`

import axios from "axios";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { postJWTAccessTokenInPage } from "../../../../../context/auth/api/action";
import { clientApiUrl } from "../../../../../utils/api";

// Función para verificar el n° de celular
const verifyPhone = (inputPhone: string) => {
  return isPossiblePhoneNumber(inputPhone);
};

// Función para verificar los parametros del formulario de dirección
export const verifyAddressFormData = (
  regionName?: string,
  regionCode?: string,
  countyName?: string,
  countyCode?: string,
  streetName?: string,
  streetNumber?: string,
  phoneNumber?: string
): Promise<{ regionCode: string; countyCode: string }> => {
  return new Promise((resolve, reject) => {
    if (!regionName) {
      return reject("Selecciona una region");
    } else if (!regionCode) {
      return reject("Selecciona una region");
    }
    if (!countyName) {
      return reject("Selecciona una comuna");
    } else if (!countyCode) {
      return reject("Selecciona una comuna");
    }
    if (!streetName) {
      return reject("Ingresa una calle");
    } else if (streetName.length < 3) {
      return reject("La calle debe tener al menos 3 caracteres");
    }
    if (!streetNumber) {
      return reject("Ingresa un numero de calle");
    } else if (streetNumber.length < 1) {
      return reject("El numero de calle debe tener al menos 1 caracter");
    }
    if (!phoneNumber) {
      return reject("Telefono no valido");
    } else if (!verifyPhone(phoneNumber)) {
      return reject("Telefono no valido");
    }
    const res = {
      regionCode: regionCode,
      countyCode: countyCode,
    };
    return resolve(res);
  });
};

// Función para enviar la nueva dirección al backend
export const postAddAddress = (
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

        const addressFormData = new FormData();
        addressFormData.append("regionName", regionName);
        addressFormData.append("regionCode", regionCode);
        addressFormData.append("countyName", countyName);
        addressFormData.append("countyCode", countyCode);
        addressFormData.append("streetName", streetName);
        addressFormData.append("streetNumber", streetNumber);
        addressFormData.append("postalCode", postalCode);
        addressFormData.append("lat", lat.toString());
        addressFormData.append("lng", lng.toString());
        addressFormData.append("phoneNumber", phoneNumber);
        addressFormData.append("comment", comment);
        addressFormData.append("isDefault", String(isDefault));

        axios
          .post(
            clientApiUrl("/api/delivery/add/address"),
            addressFormData,
            config
          )
          .then(() => {
            return resolve();
          })
          .catch((err) => {
            return reject(
              err?.response?.data?.detail ||
                "Error inesperado, intenta nuevamente"
            );
          });
      })
      .catch((err) => {
        signOutAuthState(err, true, false);
        return reject(err);
      });

    // OLD CODE VERSION
    /*if (Cookies.get("access")) {
      verifyAddressFormData(
        regionName,
        regionCode,
        countyName,
        countyCode,
        streetName,
        streetId,
        streetNumber,
        addressId,
        phoneNumber
      )
        .then(() => {
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `JWT ${Cookies.get("access")}`,
            },
          };

          const addressFormData = new FormData();
          addressFormData.append("region_name", regionName);
          addressFormData.append("region_code", regionCode);
          addressFormData.append("county_name", countyName);
          addressFormData.append("county_code", countyCode);
          addressFormData.append("street_name", streetName);
          addressFormData.append("street_id", streetId);
          addressFormData.append("street_number", streetNumber);
          addressFormData.append("address_id", addressId);
          addressFormData.append("phone_number", phoneNumber);
          addressFormData.append("comment", comment);
          addressFormData.append("is_default", String(isDefault));

          axios
            .post(
              clientApiUrl(`/api/delivery/add/address`),
              addressFormData,
              config
            )
            .then(() => {
              return resolve();
            })
            .catch((err) => {
              if (err.response.status === 401) {
                return reject("notAuthenticated");
              } else {
                return reject(err.response.data.detail);
              }
            });
        })
        .catch((err) => {
          return reject(err);
        });
    } else {
      return reject("notAuthenticated");
    }*/
  });
};
