// `components/profile/profileEditor/api/action.ts`

import axios from "axios";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { postJWTAccessTokenInPage } from "../../../../context/auth/api/action";

// Función para obtener la información actualizada del usuario
export const getProfile = (
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

        axios
          .get(
            `${process.env.NEXT_PUBLIC_URL_PRO}/api/user/get/profile`,
            config
          )
          .then((res) => {
            return resolve(res);
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

    // OLD CODE VERSION
    /*if (Cookies.get("access")) {
      const config = {
        headers: {
          Authorization: `JWT ${Cookies.get("access")}`,
          Accept: "application/json",
        },
      };

      axios
        .get(`${process.env.NEXT_PUBLIC_URL_PRO}/api/user/get/profile`, config)
        .then((res) => {
          return resolve(res);
        })
        .catch((err) => {
          if (err.response.detail === 401) {
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

// Función calcular el digito verificador del rut
const calcularDigitoVerificador = (T: number) => {
  let M = 0;
  let S = 1;

  while (T) {
    S = (S + (T % 10) * (9 - (M % 6))) % 11;
    T = Math.floor(T / 10);
    M += 1;
  }

  return (S - 1).toString() || "k";
};

// Función para verificar el rut
const verifyRut = (rut: string) => {
  // Lógica de validación del RUT
  const rutNumerico = parseInt(rut.slice(0, -1), 10);
  const digitoVerificador = rut.slice(-1).toLowerCase();

  const digitoCalculado = calcularDigitoVerificador(rutNumerico);

  return digitoCalculado === digitoVerificador;
};

// Función para verificar el n° de celular
const verifyPhone = (inputPhone: string) => {
  return isPossiblePhoneNumber(inputPhone);
};

// Función para verificar el parametro a editar
const verifyParamToEdit = async (
  param: string,
  value: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (param === "username") {
      if (!value) {
        return reject("Username not entered");
      } else if (value.length < 3) {
        return reject("Username must contain at least 3 characters");
      }
    }
    if (param === "first_name") {
      if (!value) {
        return reject("Name not entered");
      } else if (value.length < 3) {
        return reject("Name must contain at least 3 characters");
      }
    }
    if (param === "last_name") {
      if (!value) {
        return reject("Last name not entered");
      } else if (value.length < 3) {
        return reject("Last name must contain at least 3 characters");
      }
    }
    if (param === "rut") {
      if (value && !verifyRut(value)) {
        return reject("Invalid identification number");
      }
    }
    if (param === "phone") {
      if (value && !verifyPhone(value)) {
        return reject("Invalid cell phone number");
      }
    }
    return resolve();
  });
};

export const postProfileEditor = (
  param: string,
  value: string,

  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void
): Promise<any> => {
  return new Promise((resolve, reject) => {
    verifyParamToEdit(param, value)
      .then(() => {
        postJWTAccessTokenInPage()
          .then((token) => {
            const config = {
              headers: {
                Authorization: `JWT ${token}`,
                Accept: "application/json",
              },
            };

            const profileEditorFormData = new FormData();
            profileEditorFormData.append("param", param);
            profileEditorFormData.append("value", value);

            axios
              .post(
                `${process.env.NEXT_PUBLIC_URL_PRO}/api/user/profile/editor`,
                profileEditorFormData,
                config
              )
              .then(() => {
                getProfile(signOutAuthState)
                  .then((res) => {
                    return resolve(res);
                  })
                  .catch((err) => {
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
      verifyParamToEdit(param, value)
        .then(() => {
          const profileEditorFormData = new FormData();
          profileEditorFormData.append("param", param);
          profileEditorFormData.append("value", value);

          const config = {
            headers: {
              Authorization: `JWT ${Cookies.get("access")}`,
              Accept: "application/json",
            },
          };

          axios
            .post(
              `${process.env.NEXT_PUBLIC_URL_PRO}/api/user/profile/editor`,
              profileEditorFormData,
              config
            )
            .then(() => {
              getProfile()
                .then((res) => {
                  return resolve(res);
                })
                .catch((err) => {
                  return reject(err);
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
