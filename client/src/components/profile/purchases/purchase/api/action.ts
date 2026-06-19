// `components/profile/purchases/purchase/api/action.ts`

import { postJWTAccessTokenInPage } from "../../../../../context/auth/api/action";
import { PurchaseType } from "../../../../../interfaces/auth/authInterface";
import axios from "axios";
import { clientApiUrl } from "../../../../../utils/api";

export const getPurchase = (
  code: string,

  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void
): Promise<PurchaseType> => {
  return new Promise((resolve, reject) => {
    postJWTAccessTokenInPage()
      .then((token) => {
        const config = {
          headers: {
            Authorization: `JWT ${token}`,
            Accept: "application/json",
          },
        };

        axios
          .get(clientApiUrl(`/api/purchase/get/${code}`), config)
          .then((res) => {
            return resolve(res.data.order);
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

    // OLD CODE VERSION
    /*if (Cookies.get("access")) {
      const config = {
        headers: {
          Authorization: `JWT ${Cookies.get("access")}`,
          Accept: "application/json",
        },
      };
      axios
        .get(clientApiUrl(`/api/purchase/get/${code}`), config)
        .then((res) => {
          return resolve(res.data.order);
        })
        .catch((err) => {
          if (err.response.status === 401) {
            return reject("notAuthenticated");
          } else {
            return reject(err.response.data.detail);
          }
        });
    } else {
      return reject("notAuthenticated");
    }*/
  });
};

export const postUnapplyCouponFromPurchase = (
  code: string,
  commerceOrder: string,

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
            Authorization: `JWT ${token}`,
            Accept: "application/json",
          },
        };

        const formData = new FormData();
        formData.append("code", code);
        formData.append("commerceOrder", commerceOrder);

        axios
          .post(
            clientApiUrl("/api/coupons/post/unapply/coupon/from/purchase"),
            formData,
            config
          )
          .then((res) => {
            return resolve(res.data.order);
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

    // OLD CODE VERSION
    /*if (Cookies.get("access")) {
      const config = {
        headers: {
          Authorization: `JWT ${Cookies.get("access")}`,
          Accept: "application/json",
        },
      };
      const formData = new FormData();
      formData.append("code", code);
      formData.append("commerceOrder", commerceOrder);
      axios
        .post(
          clientApiUrl(`/api/coupons/post/unapply/coupon/from/purchase`),
          formData,
          config
        )
        .then((res) => {
          return resolve(res.data.order);
        })
        .catch((err) => {
          if (err.response.status === 401) {
            return reject("notAuthenticated");
          } else {
            return reject(err.response.data.detail);
          }
        });
    } else {
      return reject("notAuthenticated");
    }*/
  });
};
