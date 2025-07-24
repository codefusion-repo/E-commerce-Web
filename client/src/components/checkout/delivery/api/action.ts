// `components/checkout/delivery/api/action.ts`

import { ProductType } from "../../../../interfaces/shop/shopInterface";
import axios from "axios";

export const getRegionsCoverage = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const version = "1.0";
    const url = `https://testservices.wschilexpress.com/georeference/api/v${version}/regions`;
    const config = {
      headers: {
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_KEY_COBERTURA,
      },
    };
    axios
      .get(url, config)
      .then((res) => {
        console.log("res: ", res);
        return resolve(res);
      })
      .catch((err) => {
        return reject(err.response.data.statusDescription);
      });
  });
};

export const getCommunesCoverage = (regionCode: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const version = "1.0";
    const type = "0";
    const url = `https://testservices.wschilexpress.com/georeference/api/v${version}/coverage-areas?RegionCode=${regionCode}&type=${type}`;
    const config = {
      headers: {
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_KEY_COBERTURA,
      },
    };
    axios
      .get(url, config)
      .then((res) => {
        console.log("res: ", res);
        return resolve(res);
      })
      .catch((err) => {
        return reject(err.response.data.statusDescription);
      });
  });
};

export const postSearchedStreets = (
  countyName: string,
  streetName: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const limit = "5";
    const version = "1.0";

    const body = {
      countyName: countyName,
      streetName: streetName,
      pointsOfInterestEnabled: true,
      streetNameEnabled: true,
      roadType: 0,
    };
    console.log("body: ", body);
    const url = `https://testservices.wschilexpress.com/georeference/api/v${version}/streets/search?limit=${limit}`;
    const config = {
      headers: {
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_KEY_COBERTURA,
      },
    };

    axios
      .post(url, body, config)
      .then((res) => {
        return resolve(res);
      })
      .catch((err) => {
        return reject(err.response.data.statusDescription);
      });
  });
};

export const getSearchedStreetNumbers = (
  streetId: string,
  streetNumber: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const version = "1.0";
    const url = `https://testservices.wschilexpress.com/georeference/api/v${version}/streets/${streetId}/numbers?streetNumber=${streetNumber}`;
    const config = {
      headers: {
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_KEY_COBERTURA,
      },
    };

    axios
      .get(url, config)
      .then((res) => {
        return resolve(res);
      })
      .catch((err) => {
        return reject(err.response.data.statusDescription);
      });
  });
};

export const postValidateAddress = (
  streetName: string,
  streetNumber: string,
  countyName: string,
  regionName: string,
  previousResponseId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    console.log("previousId: ", previousResponseId);
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
        console.log("res: ", res);

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
                `Error in ${param}: "${component.componentName.text}", please correct it and try again`
              );
            } else {
              if (component.componentType === "route") {
                params.street = component.componentName.text;
              } else if (component.componentType === "street_number") {
                params.number = component.componentName.text;
              }
            }
          });
          console.log("params: ", params);
          return resolve(params);
        } else {
          return reject("Address entered is not valid");
        }
      })
      .catch((err) => {
        return reject(
          err?.response?.data?.error?.details &&
            err?.response?.data?.error?.details.length > 0
            ? `Unexpected error in parameter "${err?.response?.data?.error?.details[0]?.fieldViolations[0]?.field}", please try again`
            : "Unexpected error, please try again"
        );
      });
  });
};

export const postGeoreferenceAddress = (
  countyName?: string,
  streetName?: string,
  streetNumber?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!streetName) {
      return reject("Enter a street");
    } else if (streetName.length < 1) {
      return reject("The street must have at least 2 characters");
    }
    if (!streetNumber) {
      return reject("Enter a street number");
    } else if (streetNumber.length < 0) {
      return reject("The street number must have at least 1 character");
    }
    const version = "1.0";
    const url = `http://testservices.wschilexpress.com/georeference/api/v${version}/addresses/georeference`;

    const body = {
      countyName: countyName,
      streetName: streetName,
      number: streetNumber,
    };

    const config = {
      headers: {
        "Content-type": "application/json",
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_KEY_COBERTURA,
      },
    };
    axios
      .post(url, body, config)
      .then((res) => {
        console.log("res: ", res);
        if (res.data.data.addressId != 0) {
          return resolve(res.data.data.addressId);
        } else {
          return reject(res.data.statusDescription);
        }
      })
      .catch((err) => {
        return reject(err.response.data.statusDescription);
      });
  });
};

const postChilexpress = (
  countyCode: string,
  peso: string,
  alto: string,
  ancho: string,
  largo: string,
  subtotal: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const url = `https://testservices.wschilexpress.com/rating/api/v1.0/rates/courier`;

    const body = {
      originCountyCode: process.env.NEXT_PUBLIC_ORIGIN_COUNTY,
      destinationCountyCode: countyCode,
      package: {
        weight: peso,
        height: alto,
        width: ancho,
        length: largo,
      },
      productType: 3,
      contentType: 1,
      declaredWorth: subtotal,
      deliveryTime: 2,
    };
    const config = {
      headers: {
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_KEY_COTIZADOR,
      },
    };
    axios
      .post(url, body, config)
      .then((res) => {
        if (res.data.data.courierServiceOptions.length > 0) {
          return resolve(res.data.data.courierServiceOptions);
        } else {
          return resolve([]);
        }
      })
      .catch(() => {
        return resolve([]);
      });
  });
};
const postCorreosChile = (
  countyName: string,
  peso: string,
  alto: string,
  ancho: string,
  largo: string,
  subtotal: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const url = "https://cert-apib2bv2.correos.cl:8000/tarifas";

    const usuario = process.env.NEXT_PUBLIC_USER;
    const password = process.env.NEXT_PUBLIC_PASSWORD;
    const authorization =
      "basic " + Buffer.from(usuario + ":" + password).toString("base64");

    const config = {
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
    };

    const volume =
      (parseFloat(ancho) * parseFloat(largo) * parseFloat(alto)) / 1000000;

    const body = JSON.stringify({
      comunaRemitente: process.env.NEXT_PUBLIC_SENDER_COMMUNE,
      comunaDestino: countyName.toUpperCase(),
      tipoPortes: "P",
      bultos: 1,
      kilos: peso,
      volumen: volume,
      importeReembolso: 0,
      valorAsegurado: subtotal,
    });

    axios
      .post(url, body, config)
      .then((res) => {
        // console.log("correosChileRes: ", res);
        return resolve([]);
      })
      .catch(() => {
        return resolve([]);
      });
  });
};

const postShipit = (
  countyCode: number,
  peso: number,
  alto: number,
  ancho: number,
  largo: number
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const url = "https://api.shipit.cl/v/rates";
    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.shipit.v4",
        "X-Shipit-Email": process.env.NEXT_PUBLIC_USER,
        "X-Shipit-Access-Token": process.env.NEXT_PUBLIC_TOKEN,
      },
    };

    const originId = parseInt(
      process.env.NEXT_PUBLIC_SENDER_COMMUNE_ID || "308"
    );

    const body = {
      parcel: {
        length: largo,
        height: alto,
        width: ancho,
        weight: peso,
        origin_id: originId,
        destiny_id: countyCode,
        type_of_destiny: "domicilio",
        algorithm: 1,
      },
    };

    axios
      .post(url, body, config)
      .then((res) => {
        // console.log("resShipit: ", res);
        return resolve(res.data.prices);
      })
      .catch((err) => {
        return reject(err.response.data.message);
      });
  });
};

export const postDeliveryCotization = (
  items: ProductType[],
  countyCode?: string,
  countyName?: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!countyCode) {
      return reject("Select a shipping address");
    }
    if (!countyName) {
      return reject("Select a shipping address");
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

    /*console.log("peso: ", peso);
    console.log("alto: ", alto);
    console.log("largo: ", ancho);
    console.log("ancho: ", largo);
    console.log("subtotal: ", subtotal);*/

    postShipit(parseInt(countyCode), peso, alto, ancho, largo)
      .then((res) => {
        // console.log("ShipitRes: ", res);
        return resolve(res);
      })
      .catch((err) => {
        // console.log("ShipitErr: ", err);
        return reject(err);
      });

    /*postChilexpress(
      countyCode,
      peso.toString(),
      alto.toString(),
      ancho.toString(),
      largo.toString(),
      subtotal.toString()
    ).then((chilexpressCourierOptions) => {
      chilexpressCourierOptions.forEach((courier: any) => {
        courierServiceOptions.push(courier);
      });

      postCorreosChile(
        countyName,
        peso.toString(),
        alto.toString(),
        ancho.toString(),
        largo.toString(),
        subtotal.toString()
      ).then((correoschileCourierOptions) => {
        correoschileCourierOptions.forEach((courier: any) => {
          courierServiceOptions.push(courier);
        });
        console.log("courierServiceOptions: ", courierServiceOptions);
      });
    });*/
  });
};
