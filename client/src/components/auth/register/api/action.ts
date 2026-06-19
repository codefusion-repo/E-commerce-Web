// `components/auth/register/api/action.ts`

import axios from "axios";
import { clientApiUrl } from "@/utils/api";
import {
  Auth,
  FacebookAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { isPossiblePhoneNumber } from "react-phone-number-input";

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

// Función para verificar el email
const verifyEmail = (inputEmail: string) => {
  // Expresión regular para validar un email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(inputEmail)) {
    return true;
  } else {
    return false;
  }
};

// Función para verificar el n° de celular
const verifyPhone = (inputPhone: string) => {
  return isPossiblePhoneNumber(inputPhone);
};

// Función para verificar los parametros de registro
const verifyPasswordProviderParams = async (
  username: string,
  email: string,
  first_name: string,
  last_name: string,
  password: string,
  re_password: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!username) {
      return reject("Username not entered");
    }
    if (!email) {
      return reject("Email not entered");
    } else if (!verifyEmail(email)) {
      return reject("Email not valid");
    }
    if (!first_name) {
      return reject("Name not entered");
    } else if (first_name.length < 3) {
      return reject("Name must contain at least 3 characters");
    }
    if (!last_name) {
      return reject("Last name not entered");
    } else if (first_name.length < 3) {
      return reject("Last name must contain at least 3 characters");
    }
    if (!password) {
      return reject("Password not entered");
    } else if (password.length < 6) {
      return reject("Password must contain at least 6 characters");
    } else if (!/[A-Za-z]/.test(password)) {
      return reject("Password must contain at least one letter");
    } else if (!/\d/.test(password)) {
      return reject("Password must contain at least one number");
    }
    if (!re_password) {
      return reject("Repeat password not entered");
    } else if (password !== re_password) {
      return reject("Passwords do not match");
    }

    return resolve();
  });
};

// Función para enviar el registro de usuario al backend
const postRegisterForm = async (
  token: string,
  uid: string,
  username: string,
  email: string,
  first_name: string,
  last_name: string,
  rut: string,
  phone: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const registerFormData = new FormData();
    registerFormData.append("token", token);
    registerFormData.append("uid", uid);
    registerFormData.append("username", username);
    registerFormData.append("email", email);
    registerFormData.append("first_name", first_name);
    registerFormData.append("last_name", last_name);
    registerFormData.append("rut", rut);
    registerFormData.append("phone", phone);

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios
      .post(
        clientApiUrl(`/api/my/auth/register`),
        registerFormData,
        config
      )
      .then((res) => {
        return resolve(res);
      })
      .catch((err) => {
        console.log("err", err);
        return reject(err.response.data.detail);
      });
  });
};

// Función para registrar al usuario en firebase (Frontend)
export const postFirebaseRegister = async (
  auth: Auth,
  username: string,
  email: string,
  first_name: string,
  last_name: string,
  rut: string,
  phone: string,
  password: string,
  re_password: string,
  currentProvider: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (rut && !verifyRut(rut)) {
      return reject("Invalid ID number");
    }
    if (phone && !verifyPhone(phone)) {
      return reject("Invalid phone number");
    }
    if (currentProvider === "password") {
      verifyPasswordProviderParams(
        username,
        email,
        first_name,
        last_name,
        password,
        re_password
      )
        .then(() => {
          createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
              let user = userCredential.user;
              user.getIdToken(false).then((idToken) => {
                let token = idToken;
                let email = "";
                let uid = user.uid;
                if (user.email) {
                  email = user.email;
                }
                setTimeout(() => {
                  postRegisterForm(
                    token,
                    uid,
                    username,
                    email,
                    first_name,
                    last_name,
                    rut,
                    phone
                  )
                    .then((res) => {
                      return resolve(res);
                    })
                    .catch((err) => {
                      return reject(err);
                    });
                }, 3000);
              });
            })
            .catch((err) => {
              return reject(err.code);
            });
        })
        .catch((err) => {
          return reject(err);
        });
    } else {
      let provider:
        | GoogleAuthProvider
        | FacebookAuthProvider
        | TwitterAuthProvider = new GoogleAuthProvider();

      if (currentProvider === "google.com") {
        provider = new GoogleAuthProvider();
      }
      if (currentProvider === "facebook.com") {
        provider = new FacebookAuthProvider();
        provider.setCustomParameters({
          display: "popup",
        });
      }
      if (currentProvider === "twitter.com") {
        provider = new TwitterAuthProvider();
        provider.setCustomParameters({
          lang: "es",
        });
      }
      signInWithPopup(auth, provider)
        .then((userCredential) => {
          let user = userCredential.user;
          user.getIdToken(false).then((idToken) => {
            let token = idToken;
            let username = "";
            let email = "";
            let uid = user.uid;
            let first_name = "";
            let last_name = "";
            let phoneF = "";

            if (user.email) {
              email = user.email;
            }
            if (user.displayName) {
              username = user.displayName;
              first_name = user.displayName;
              last_name = user.displayName;
            }
            if (user.phoneNumber) {
              phoneF = user.phoneNumber;
            } else {
              phoneF = phone;
            }
            setTimeout(() => {
              postRegisterForm(
                token,
                uid,
                username,
                email,
                first_name,
                last_name,
                rut,
                phoneF
              )
                .then((res) => {
                  return resolve(res);
                })
                .catch((err) => {
                  return reject(err);
                });
            }, 3000);
          });
        })
        .catch((err) => {
          return reject(err.code);
        });
    }
  });
};
