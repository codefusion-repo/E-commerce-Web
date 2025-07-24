// `components/shop/product/comment/add/api/action.ts`

import { postJWTAccessTokenInPage } from "../../../../../../../context/auth/api/action";
import axios from "axios";

export const postComment = (
  stars: number,
  comment: string,
  productId: string,

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

        const commentFormData = new FormData();
        commentFormData.append("stars", stars.toString());
        commentFormData.append("comment", comment);
        commentFormData.append("id", productId);

        axios
          .post(
            `${process.env.NEXT_PUBLIC_URL_PRO}/api/shop/create/comment`,
            commentFormData,
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
        signOutAuthState(err, false, true);
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
      const commentFormData = new FormData();
      commentFormData.append("stars", stars.toString());
      commentFormData.append("comment", comment);
      commentFormData.append("id", productId);

      axios
        .post(
          `${process.env.NEXT_PUBLIC_URL_PRO}/api/shop/create/comment`,
          commentFormData,
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
