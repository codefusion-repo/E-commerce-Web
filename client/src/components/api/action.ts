import axios from "axios";
import { User } from "firebase/auth";

export const postResendVerifyCode = (user: User | null): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (user) {
      const email = user.email;
      if (email) {
        const verifyCodeFormData = new FormData();
        verifyCodeFormData.append("email", email);

        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        axios
          .post(
            `${process.env.NEXT_PUBLIC_URL_PRO}/api/user/resend/verify/code`,
            verifyCodeFormData,
            config
          )
          .then(() => {
            return resolve();
          })
          .catch((err) => {
            return reject(err.response.data.detail);
          });
      } else {
        return reject("Unexpected problem");
      }
    } else {
      return reject("Unexpected problem");
    }
  });
};
