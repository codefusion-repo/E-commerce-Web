// `components/other/contact/api/action.ts`

import axios from "axios";

export const postSendMessage = (
  email: string,
  name: string,
  message: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const MessageFormData = new FormData();
    MessageFormData.append("email", email);
    MessageFormData.append("name", name);
    MessageFormData.append("message", message);
    axios
      .post(
        `${process.env.NEXT_PUBLIC_URL_PRO}/api/contact/send/message`,
        MessageFormData,
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
