// `components/checkout/delivery/defaultAddress/api/action.ts`

import { postJWTAccessTokenInPage } from "../../../../../context/auth/api/action";
import axios from "axios";

export const setDefaultAddress = (
  id: string,

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
            "Content-Type": "application/json",
            Authorization: `JWT ${token}`,
          },
        };

        const setDefaultAddressFormData = new FormData();
        setDefaultAddressFormData.append("id", id);

        axios
          .post(
            `${process.env.NEXT_PUBLIC_URL_PRO}/api/delivery/set/default/address`,
            setDefaultAddressFormData,
            config
          )
          .then((res) => {
            return resolve(res.data.detail);
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
      const setDefaultAddressFormData = new FormData();
      setDefaultAddressFormData.append("id", id);

      axios
        .post(
          `${process.env.NEXT_PUBLIC_URL_PRO}/api/delivery/set/default/address`,
          setDefaultAddressFormData,
          config
        )
        .then((res) => {
          return resolve(res.data.detail);
        })
        .catch((err) => {
          return reject(err.response.data.detail);
        });
    } else {
      return reject("notAuthenticated");
    }*/
  });
};
