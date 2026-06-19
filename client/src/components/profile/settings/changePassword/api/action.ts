// `components/profile/settings/changePassword/api/action.ts`

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

// Función para cambiar la contraseña actual
export const postChangePassword = (
  password: string,
  newPassword: string,
  newRePassword: string,
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
    reauthenticate(password, user, email)
      .then(() => {
        verifyPassword(newPassword, newRePassword)
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
                setPasswordFormData.append("password", newPassword);

                axios
                  .post(
                    clientApiUrl(`/api/user/set/password`),
                    setPasswordFormData,
                    config
                  )
                  .then((res) => {
                    reauthenticate(newPassword, user, email)
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
      })
      .catch(() => {
        return reject("Incorrect current password");
      });

    // OLD CODE VERSION
    /*if (Cookies.get("access")) {
      reauthenticate(password, user, email)
        .then(() => {
          verifyPassword(newPassword, newRePassword)
            .then(() => {
              const setPasswordFormData = new FormData();
              setPasswordFormData.append("password", newPassword);

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
                  reauthenticate(newPassword, user, email)
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
        })
        .catch((err) => {
          return reject("Contraseña incorrecta");
        });
    } else {
      return reject("notAuthenticated");
    }*/
  });
};

// Función para recibir el código de confirmación de la contraseña olvidada
/*export const postForgotPassword = (email: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const setForgotPasswordFormData = new FormData();
    setForgotPasswordFormData.append("email", email);

    const config = {
      headers: {
        Accept: "application/json",
      },
    };
    axios
      .post(
        clientApiUrl(`/api/user/forgot/password`),
        setForgotPasswordFormData,
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

// Función para enviar el código de confirmación de la contraseña olvidada
export const postForgotPasswordCode = (
  email: string,
  code: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!email) {
      return reject("Error no esperado, por favor vuelve a intentarlo");
    }
    if (!code) {
      return reject("N° de verificación no ingresado");
    } else if (code.length != 6) {
      return reject("N° de verificación debe tener 6 números");
    }

    const setForgotPasswordCodeFormData = new FormData();
    setForgotPasswordCodeFormData.append("email", email);
    setForgotPasswordCodeFormData.append("code", code);

    const config = {
      headers: {
        Accept: "application/json",
      },
    };

    axios
      .post(
        clientApiUrl(`/api/user/receive/code/forgot/password`),
        setForgotPasswordCodeFormData,
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

// Función para cambiar la contraseña olvidada
export const postChangeForgottenPassword = (
  email: string,
  newPassword: string,
  newRePassword: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    verifyPassword(newPassword, newRePassword)
      .then(() => {
        const setPasswordFormData = new FormData();
        setPasswordFormData.append("email", email);
        setPasswordFormData.append("password", newPassword);

        const config = {
          headers: {
            Accept: "application/json",
          },
        };
        axios
          .post(
            clientApiUrl(`/api/user/change/forgotten/password`),
            setPasswordFormData,
            config
          )
          .then((res) => {
            return resolve(res);
          })
          .catch((err) => {
            return reject(err.response.data.detail);
          });
      })
      .catch((err) => {
        return reject(err);
      });
  });
};*/
