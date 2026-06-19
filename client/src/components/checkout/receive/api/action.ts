// `components/checkout/receive/api/action.ts`

import { postJWTAccessTokenInPage } from "../../../../context/auth/api/action";
import axios from "axios";
import { clientApiUrl } from "../../../../utils/api";

export const postReceiveFlow = (
  paymentId: string,

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

        const receivePaymentFormData = new FormData();
        receivePaymentFormData.append("token", paymentId);

        axios
          .post(
            clientApiUrl("/api/payment/receive/flow"),
            receivePaymentFormData,
            config
          )
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
