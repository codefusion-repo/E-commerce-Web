// `components/checkout/delivery/delete/api/action.ts`

import { postJWTAccessTokenInPage } from "../../../../../context/auth/api/action";
import axios from "axios";

// Función para borrar una dirección
export const postDeleteAddress = (
  id: string,

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

        const deleteAddressFormData = new FormData();
        deleteAddressFormData.append("id", id);

        axios
          .post(
            `${process.env.NEXT_PUBLIC_URL_PRO}/api/delivery/delete/address`,
            deleteAddressFormData,
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

      const removeAddressFormData = new FormData();
      removeAddressFormData.append("id", id);

      axios
        .post(
          `${process.env.NEXT_PUBLIC_URL_PRO}/api/delivery/delete/address`,
          removeAddressFormData,
          config
        )
        .then((res) => {
          return resolve();
        })
        .catch((err) => {
          return reject(err.response.data.detail);
        });
    } else {
      return reject("notAuthenticated");
    }*/
  });
};
