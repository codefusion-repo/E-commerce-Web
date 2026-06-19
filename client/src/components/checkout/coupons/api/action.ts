// `components/checkout/coupons/api/action.ts`

import { UserType } from "@/interfaces/auth/authInterface";
import { postJWTAccessTokenInPage } from "../../../../context/auth/api/action";
import { CouponType } from "../../../../interfaces/shop/shopInterface";
import axios from "axios";
import { clientApiUrl } from "../../../../utils/api";

// Función para aplicar cupón
export const postClaimCoupon = (
  coupon_code: string,
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

        const couponFormData = new FormData();
        couponFormData.append("coupon_code", coupon_code);

        axios
          .post(clientApiUrl("/api/coupons/claim"), couponFormData, config)
          .then((res) => {
            return resolve(res.data);
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

// Función para aplicar un cupón
export const postApplyCoupon = (
  code: string,

  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void
): Promise<CouponType> => {
  return new Promise((resolve, reject) => {
    postJWTAccessTokenInPage()
      .then((token) => {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${token}`,
          },
        };

        const couponFormData = new FormData();
        couponFormData.append("code", code);

        axios
          .post(
            clientApiUrl("/api/coupons/post/apply/coupon"),
            couponFormData,
            config
          )
          .then((res) => {
            return resolve(res.data.coupon);
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
          "Content-Type": "application/json",
          Authorization: `JWT ${Cookies.get("access")}`,
        },
      };
      const couponFormData = new FormData();
      couponFormData.append("code", code);

      axios
        .post(
          clientApiUrl(`/api/coupons/post/apply/coupon`),
          couponFormData,
          config
        )
        .then((res) => {
          return resolve(res.data.coupon);
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

// Función para desaplicar un cupón
export const postUnpplyCoupon = (
  code: string,

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

        const couponFormData = new FormData();
        couponFormData.append("code", code);

        axios
          .post(
            clientApiUrl("/api/coupons/post/unapply/coupon"),
            couponFormData,
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

    // OLD CODE VERSION
    /*if (Cookies.get("access")) {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${Cookies.get("access")}`,
        },
      };
      const couponFormData = new FormData();
      couponFormData.append("code", code);

      axios
        .post(
          clientApiUrl(`/api/coupons/post/unapply/coupon`),
          couponFormData,
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
    } else {
      return reject("notAuthenticated");
    }*/
  });
};

// Función para verificar la disponibilidad del cupón
export const verifyCoupon = (
  code: string,

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

        const verifyCouponFormData = new FormData();
        verifyCouponFormData.append("code", code);

        axios
          .post(
            clientApiUrl("/api/coupons/post/verify/coupon"),
            verifyCouponFormData,
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

    // OLD CODE VERSION
    /*if (Cookies.get("access")) {
      const config = {
        headers: {
          Authorization: `JWT ${Cookies.get("access")}`,
          Accept: "application/json",
        },
      };

      const verifyCouponFormData = new FormData();
      verifyCouponFormData.append("code", code);

      axios
        .post(
          clientApiUrl(`/api/coupons/post/verify/coupon`),
          verifyCouponFormData,
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
    } else {
      return reject("notAuthenticated");
    }*/
  });
};
