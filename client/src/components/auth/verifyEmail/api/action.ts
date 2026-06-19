// `components/auth/verifyEmail/api/action.ts`

import axios from "axios";
import { clientApiUrl } from "@/utils/api";

export const postVerifyEmailNumber = async (
  token: string,
  uid: string,
  verifyEmailNumber: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject("Problem not expected, try again later");
    }
    if (!uid) {
      return reject("Problem not expected, try again later");
    }
    if (!verifyEmailNumber) {
      return reject("Verification number not entered");
    } else if (verifyEmailNumber.length != 6) {
      return reject("Verification number must have 6 numbers");
    }

    const verifyEmailFormData = new FormData();

    verifyEmailFormData.append("token", token);
    verifyEmailFormData.append("uid", uid);
    verifyEmailFormData.append("verifyEmailNumber", verifyEmailNumber);

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios
      .post(
        clientApiUrl(`/api/my/auth/verify/email`),
        verifyEmailFormData,
        config
      )
      .then((res) => {
        return resolve(res);
      })
      .catch((err) => {
        return reject(err.response.data.detail);
      });
  });
};
