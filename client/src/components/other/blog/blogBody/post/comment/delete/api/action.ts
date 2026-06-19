// `components/other/blog/post/comment/delete/api/action.ts`

import { postJWTAccessTokenInPage } from "../../../../../../../../context/auth/api/action";
import axios from "axios";
import { clientApiUrl } from "@/utils/api";

export const postDeleteComment = (
  commentId: string,

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

        const deleteCommentFormData = new FormData();
        deleteCommentFormData.append("id", commentId);

        axios
          .post(
            clientApiUrl(`/api/blog/delete/comment`),
            deleteCommentFormData,
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
  });
};
