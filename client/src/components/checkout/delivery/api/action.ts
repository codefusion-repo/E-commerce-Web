// `components/checkout/delivery/api/action.ts`

import { postJWTAccessTokenInPage } from "../../../../context/auth/api/action";
import { ProductType } from "../../../../interfaces/shop/shopInterface";
import axios from "axios";
import { clientApiUrl } from "../../../../utils/api";

export const postValidateAddress = (
  streetName: string,
  streetNumber: string,
  countyName: string,
  regionName: string,
  previousResponseId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const address = {
      regionCode: "CL",
      addressLines: [
        `${streetName} ${streetNumber}`,
        `${countyName}, ${regionName}`,
      ],
    };

    const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS}`;

    const body = {
      address: address,
      previousResponseId: previousResponseId,
    };

    axios
      .post(url, body)
      .then((res) => {
        const addressComponents =
          res?.data?.result?.address?.addressComponents || [];

        if (addressComponents.length > 0) {
          let params = {
            street: "",
            number: "",
            postalCode:
              res?.data?.result?.address?.postalAddress?.postalCode || "",
            lat: res?.data?.result?.geocode?.location?.latitude || 0,
            lng: res?.data?.result?.geocode?.location?.longitude || 0,
            preResId: res?.data?.responseId || "",
          };

          addressComponents.forEach((component: any) => {
            if (component.confirmationLevel !== "CONFIRMED") {
              let param = "";

              if (component.componentType === "route") {
                param = "street";
              } else if (component.componentType === "street_number") {
                param = "street number";
              } else {
                param = "the parameter";
              }

              return reject(
                `Error en ${param}: "${component.componentName.text}", corrigelo e intenta nuevamente`
              );
            } else {
              if (component.componentType === "route") {
                params.street = component.componentName.text;
              } else if (component.componentType === "street_number") {
                params.number = component.componentName.text;
              }
            }
          });
          return resolve(params);
        } else {
          return reject("La direccion ingresada no es valida");
        }
      })
      .catch((err) => {
        return reject(
          err?.response?.data?.error?.details &&
            err?.response?.data?.error?.details.length > 0
            ? `Error inesperado en el parametro "${err?.response?.data?.error?.details[0]?.fieldViolations[0]?.field}", intenta nuevamente`
            : "Error inesperado, intenta nuevamente"
        );
      });
  });
};

const postShipit = (
  destiny_id: number,
  weight: number,
  height: number,
  width: number,
  length: number,

  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void
): Promise<any> => {
  return new Promise((resolve, reject) => {
    postJWTAccessTokenInPage()
      .then((token) => {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${token}`,
          },
        };

        const shipitFormData = new FormData();
        shipitFormData.append("length", String(length));
        shipitFormData.append("height", String(height));
        shipitFormData.append("width", String(width));
        shipitFormData.append("weight", String(weight));
        shipitFormData.append("destiny_id", String(destiny_id));

        axios
          .post(
            clientApiUrl("/api/delivery/post/shipit"),
            shipitFormData,
            config
          )
          .then((res) => {
            return resolve(res.data);
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
  });
};

export const postDeliveryCotization = (
  items: ProductType[],
  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void,

  countyCode?: string,
  countyName?: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!countyCode) {
      return reject("Selecciona una direccion de envio");
    }
    if (!countyName) {
      return reject("Selecciona una direccion de envio");
    }

    let peso = 0;
    let alto = 0;
    let largo = 0;
    let ancho = 0;

    let subtotal = 0;

    if (items && items.length > 0) {
      items.forEach((item) => {
        let itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        if (item.dimensions) {
          peso += item.dimensions.weight;

          if (
            alto < item.dimensions.height &&
            largo < item.dimensions.length &&
            ancho < item.dimensions.width
          ) {
            alto = item.dimensions.height;
            largo = item.dimensions.length;
            ancho = item.dimensions.width;
          }
        } else {
          peso += 0.01;
          alto = 1;
          largo = 1;
          ancho = 1;
        }
      });
    } else {
      return reject("No products in your shopping cart");
    }

    postShipit(parseInt(countyCode), peso, alto, ancho, largo, signOutAuthState)
      .then((res) => {
        return resolve(res);
      })
      .catch((err) => {
        return reject(err);
      });
  });
};
