// `components/profile/purchases/api/action.ts`

import { postJWTAccessTokenInPage } from "../../../../context/auth/api/action";
import { ProductType } from "../../../../interfaces/shop/shopInterface";
import axios from "axios";
import { clientApiUrl } from "../../../../utils/api";

const getApiErrorMessage = (err: any): string => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim().length > 0) {
    return detail;
  }
  if (detail) {
    return String(detail);
  }
  if (err?.response?.status) {
    return `Request failed with status ${err.response.status}`;
  }
  if (err?.code === "ECONNABORTED") {
    return "The payment request timed out. Please try again.";
  }
  if (err?.request) {
    return "The backend did not respond. Check API URL, CORS, or network configuration.";
  }
  return err?.message || "Unexpected error, please try again";
};

export const postResendPurchaseOrder = (
  commerceOrder: string,
  method: string,

  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    postJWTAccessTokenInPage()
      .then((token) => {
        const config = {
          headers: {
            Authorization: `JWT ${token}`,
            Accept: "application/json",
          },
          timeout: 30000,
        };

        const purchaseFormData = new FormData();
        purchaseFormData.append("commerceOrder", commerceOrder);
        purchaseFormData.append("method", method);

        axios
          .post(clientApiUrl("/api/purchase/resend"), purchaseFormData, config)
          .then((res) => {
            return resolve(res.data.url);
          })
          .catch((err) => {
            return reject(getApiErrorMessage(err));
          });
      })
      .catch((err) => {
        signOutAuthState(err, true, false);
        return reject(err);
      });
  });
};

export const postCreatePurchaseOrder = (
  items: ProductType[] | undefined,
  selectedCourier: any | undefined,
  addressId: string | undefined,
  method: string,

  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void,
  couponCode?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!items) {
      return reject("No hay productos en el carrito");
    }
    if (!selectedCourier) {
      return reject("Delivery method not selected");
    }
    if (!addressId) {
      return reject("Address not selected");
    }
    postJWTAccessTokenInPage()
      .then((token) => {
        const config = {
          headers: {
            Authorization: `JWT ${token}`,
            Accept: "application/json",
          },
          timeout: 30000,
        };

        const purchaseFormData = new FormData();
        purchaseFormData.append("items", JSON.stringify(items));
        purchaseFormData.append(
          "serviceDescription",
          selectedCourier.original_courier
        );
        purchaseFormData.append("addressId", addressId);
        purchaseFormData.append("method", method);
        if (couponCode) {
          purchaseFormData.append("couponCode", couponCode);
        }

        axios
          .post(clientApiUrl("/api/purchase/create"), purchaseFormData, config)
          .then((res) => {
            return resolve(res.data.url);
          })
          .catch((err) => {
            return reject(getApiErrorMessage(err));
          });
      })
      .catch((err) => {
        signOutAuthState(err, true, false);
        return reject(err);
      });
  });
};
