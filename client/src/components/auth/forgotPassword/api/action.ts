// `components/auth/forgotPassowrd/api/action.ts`

import axios from "axios";

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

// Función para recibir el código de confirmación de la contraseña olvidada
export const postForgotPassword = (email: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!email) {
      return reject("Email not entered");
    }

    const config = {
      headers: {
        Accept: "application/json",
      },
    };

    const setForgotPasswordFormData = new FormData();
    setForgotPasswordFormData.append("email", email);

    axios
      .post(
        `${process.env.NEXT_PUBLIC_URL_PRO}/api/user/forgot/password`,
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
export const postChangeForgotPassword = (
  email: string,
  code: string,
  newPassword: string,
  newRePassword: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!email) {
      return reject("Unexpected error, please try again");
    }
    if (!code) {
      return reject("Verification number not entered");
    } else if (code.length != 6) {
      return reject("Verification number must have 6 numbers");
    }

    verifyPassword(newPassword, newRePassword)
      .then(() => {
        const config = {
          headers: {
            Accept: "application/json",
          },
        };

        const changeForgotPasswordFormData = new FormData();
        changeForgotPasswordFormData.append("email", email);
        changeForgotPasswordFormData.append("code", code);
        changeForgotPasswordFormData.append("newPassword", newPassword);

        axios
          .post(
            `${process.env.NEXT_PUBLIC_URL_PRO}/api/user/receive/change/forgot/password`,
            changeForgotPasswordFormData,
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
};
