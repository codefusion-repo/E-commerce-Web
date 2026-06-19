// `components/other/newsletter/api/action.ts`

import axios from "axios";
import { clientApiUrl } from "@/utils/api";

export const postNewsletter = (email: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const newsletterFormData = new FormData();
    newsletterFormData.append("email", email);

    axios
      .post(
        clientApiUrl(`/api/contact/user/in/newsletter`),
        newsletterFormData,
        config
      )
      .then((res) => {
        return resolve(res.data.detail);
      })
      .catch((err) => {
        return reject(err.response.data.detail);
      });
  });
};
