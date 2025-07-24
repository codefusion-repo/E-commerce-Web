// `context/auth/api/action.ts`

import axios from "axios";
import Cookies from "js-cookie";

// Función para verificar el token de firebase en el cliente
export const postVerifyFirebaseIdToken = (
  token: string,
  email: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const verifyTokenFormData = new FormData();
    verifyTokenFormData.append("token", token);
    verifyTokenFormData.append("email", email);

    axios
      .post(
        `${process.env.NEXT_PUBLIC_URL_PRO}/api/my/auth/verify/firebase/id/token`,
        verifyTokenFormData,
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

// Función para obtener un nuevo token de acceso con el refresh token en el cliente
const postJWTRefreshTokenInPage = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!Cookies.get("refresh")) {
      return reject("Session token has expired, please log in again");
    }

    const config = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    const body = JSON.stringify({ refresh: Cookies.get("refresh") });

    axios
      .post(
        `${process.env.NEXT_PUBLIC_URL_PRO}/api/my/auth/refresh`,
        body,
        config
      )
      .then((res) => {
        Cookies.set("access", res.data.access);
        Cookies.set("refresh", res.data.refresh);
        const token = res.data.access;
        return resolve(token);
      })
      .catch(() => {
        return reject("Session token has expired, please log in again");
      });
  });
};

// Función para verificar el token de acceso en el cliente
export const postJWTAccessTokenInPage = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!Cookies.get("access")) {
      return reject("Session token has expired, please log in again");
    }

    const token: string = Cookies.get("access") || "";

    const config = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    const body = JSON.stringify({ token: token });

    axios
      .post(
        `${process.env.NEXT_PUBLIC_URL_PRO}/api/my/auth/verify`,
        body,
        config
      )
      .then(() => {
        return resolve(token);
      })
      .catch(() => {
        postJWTRefreshTokenInPage()
          .then((token) => {
            return resolve(token);
          })
          .catch((err) => {
            return reject(err);
          });
      });
  });
};
