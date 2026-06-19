// `components/profile/settings/deleteAccount/api/action.ts`

import { postJWTAccessTokenInPage } from "../../../../../context/auth/api/action";
import axios from "axios";
import { clientApiUrl } from "@/utils/api";

// Función para borrar al usuario y recibir el n° de confirmación
export const postDeleteAccount = (
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
            Authorization: `JWT ${token}`,
            Accept: "application/json",
          },
        };

        axios
          .post(
            clientApiUrl(`/api/user/delete/account`),
            null,
            config
          )
          .then((res) => {
            return resolve(res);
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
        .post(
          clientApiUrl(`/api/user/delete/account`),
          null,
          config
        )
        .then((res) => {
          return resolve(res);
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

// Función para enviar el n° de confirmación y borrar al usuario definitivamente
export const postDeleteAccountConfirm = (
  code: string,

  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!code) {
      return reject("Verification number not entered");
    } else if (code.length != 6) {
      return reject("Verification number must have 6 numbers");
    }
    postJWTAccessTokenInPage()
      .then((token) => {
        const config = {
          headers: {
            Authorization: `JWT ${token}`,
            Accept: "application/json",
          },
        };

        const deleteAccountFormData = new FormData();
        deleteAccountFormData.append("code", code);

        axios
          .post(
            clientApiUrl(`/api/user/receive/delete/account`),
            deleteAccountFormData,
            config
          )
          .then((res) => {
            return resolve(res);
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
      if (!code) {
        return reject("N° de verificación no ingresado");
      } else if (code.length != 6) {
        return reject("N° de verificación debe tener 6 números");
      }

      const deleteAccountFormData = new FormData();
      deleteAccountFormData.append("code", code);

      const config = {
        headers: {
          Authorization: `JWT ${Cookies.get("access")}`,
          Accept: "application/json",
        },
      };
      axios
        .post(
          clientApiUrl(`/api/user/receive/delete/account`),
          deleteAccountFormData,
          config
        )
        .then((res) => {
          return resolve(res);
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
