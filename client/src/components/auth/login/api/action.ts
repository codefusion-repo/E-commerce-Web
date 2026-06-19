// `components/auth/login/api/action.ts`

import axios from "axios";
import { clientApiUrl } from "@/utils/api";
import {
  Auth,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  TwitterAuthProvider,
} from "firebase/auth";

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

// Función para verificar los parametros de inicio de sesión
const verifyPasswordProviderParams = async (
  email: string,
  password: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!email) {
      return reject("Email not entered");
    } else if (!verifyEmail(email)) {
      return reject("Email not valid");
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
    return resolve();
  });
};

// Función para iniciar sesión en el backend
const postLoginForm = async (token: string, email: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const loginFormData = new FormData();
    loginFormData.append("token", token);
    loginFormData.append("email", email);

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios
      .post(
        clientApiUrl(`/api/my/auth/login`),
        loginFormData,
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

// Función para iniciar sesión en firebase (Frontend)
export const postFirebaseLogin = async (
  auth: Auth,
  email: string,
  password: string,
  currentProvider: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (currentProvider === "password") {
      verifyPasswordProviderParams(email, password)
        .then(() => {
          signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
              let user = userCredential.user;
              user.getIdToken(false).then((idToken) => {
                let token = idToken;
                let email = "";
                if (user.email) {
                  email = user.email;
                }
                setTimeout(() => {
                  postLoginForm(token, email)
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
            let email = "";
            if (user.email) {
              email = user.email;
            }
            setTimeout(() => {
              postLoginForm(token, email)
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
