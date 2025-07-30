// `components/profile/purchases/api/action.ts`

import { postJWTAccessTokenInPage } from "../../../../context/auth/api/action";
import { ProductType } from "../../../../interfaces/shop/shopInterface";
import axios from "axios";

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
        };

        const purchaseFormData = new FormData();
        purchaseFormData.append("commerceOrder", commerceOrder);
        purchaseFormData.append("method", method);

        axios
          .post(
            `${process.env.NEXT_PUBLIC_URL_PRO}/api/purchase/resend`,
            purchaseFormData,
            config
          )
          .then((res) => {
            console.log("purchase_response", res);
            return resolve(res.data.url);
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
      return reject("There are no products in your shopping cart");
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
        };

        const purchaseFormData = new FormData();
        purchaseFormData.append("items", JSON.stringify(items));
        purchaseFormData.append("deliveryCost", String(selectedCourier.price));
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
          .post(
            `${process.env.NEXT_PUBLIC_URL_PRO}/api/purchase/create`,
            purchaseFormData,
            config
          )
          .then((res) => {
            return resolve(res.data.url);
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
