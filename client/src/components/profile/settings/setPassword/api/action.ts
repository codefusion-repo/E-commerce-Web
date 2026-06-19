// `components/profile/settings/setPassword/api/action.ts`

import { postJWTAccessTokenInPage } from "../../../../../context/auth/api/action";
import axios from "axios";
import { clientApiUrl } from "@/utils/api";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
} from "firebase/auth";

// Función para validar la contraseña
const verifyPassword = (
  password: string,
  rePassword: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!password) {
      return reject("Password not entered");
    } else if (password.length < 6) {
      return reject("Password must contain at least 6 characters");
    } else if (!/[A-Za-z]/.test(password)) {
      return reject("Password must contain at least one letter");
    } else if (!/\d/.test(password)) {
      return reject("Password must contain at least one number");
    }
    if (!rePassword) {
      return reject("Repeat password not entered");
    } else if (password !== rePassword) {
      return reject("Passwords do not match");
    }

    return resolve();
  });
};

// Función para reautenticar al usuario con password
const reauthenticate = (currentPassword: string, user: User, email: string) => {
  const credential = EmailAuthProvider.credential(email, currentPassword);
  return reauthenticateWithCredential(user, credential);
};

// Función para configurar una nueva contraseña
export const postSetPassword = (
  password: string,
  rePassword: string,
  user: User,
  email: string,
  syncProviders: (user: User) => void,

  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void
): Promise<any> => {
  return new Promise((resolve, reject) => {
    verifyPassword(password, rePassword)
      .then(() => {
        postJWTAccessTokenInPage()
          .then((token) => {
            const config = {
              headers: {
                Authorization: `JWT ${token}`,
                Accept: "application/json",
              },
            };

            const setPasswordFormData = new FormData();
            setPasswordFormData.append("password", password);

            axios
              .post(
                clientApiUrl(`/api/user/set/password`),
                setPasswordFormData,
                config
              )
              .then((res) => {
                reauthenticate(password, user, email)
                  .then((userCredential) => {
                    syncProviders(userCredential.user);
                    return resolve(res);
                  })
                  .catch(() => {
                    const err = "Authentication error, please log in again";
                    signOutAuthState(err, true, false);
                    return reject(err);
                  });
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
      })
      .catch((err) => {
        return reject(err);
      });

    // OLD CODE VERSION
    /*if (Cookies.get("access")) {
        verifyPassword(password, rePassword)
          .then(() => {
            const setPasswordFormData = new FormData();
            setPasswordFormData.append("password", password);
  
            const config = {
              headers: {
                Authorization: `JWT ${Cookies.get("access")}`,
                Accept: "application/json",
              },
            };
            axios
              .post(
                clientApiUrl(`/api/user/set/password`),
                setPasswordFormData,
                config
              )
              .then((res) => {
                reauthenticate(password, user, email)
                  .then((userCredential) => {
                    syncProviders(userCredential.user);
                    return resolve(res);
                  })
                  .catch((err) => {
                    return reject("notAuthenticated");
                  });
              })
              .catch((err) => {
                if (err.response.status === 401) {
                  return reject("notAuthenticated");
                } else {
                  return reject(err.response.data.detail);
                }
              });
          })
          .catch((err) => {
            return reject(err);
          });
      } else {
        return reject("notAuthenticated");
      }*/
  });
};
