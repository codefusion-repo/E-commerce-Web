"use client";
// forgotPassword

import { useModal } from "../../../context/modal/modalContext";
import Image from "next/image";
import loadingGif from "../../../assets/cargando/loading2.gif";
import { ChangeEvent, FormEvent, useState } from "react";
import { postChangeForgotPassword, postForgotPassword } from "./api/action";

export default function ForgotPassword() {
  const { openModal, setMessage } = useModal();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("default");

  const [forgotPasswordFormdata, setForgotPasswordFormData] = useState({
    email: "",
    newPassword: "",
    reNewPassword: "",
    code: "",
  });

  const { email, newPassword, reNewPassword, code } = forgotPasswordFormdata;

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForgotPasswordFormData({
      ...forgotPasswordFormdata,
      [e.target.name]: e.target.value,
    });

  const handleBackLogin = () => {
    openModal("login", null);
  };

  const onSubmitForgotPassword = (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    postForgotPassword(email)
      .then((res) => {
        setMessage(res.data.detail);
        setStatus(res.data.email.status);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  const onSubmitForgotPasswordConfirm = (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    postChangeForgotPassword(email, code, newPassword, reNewPassword)
      .then((res) => {
        openModal("login", res.data.detail);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };
  const resendVerifyCode = () => {
    setError(null);
    setLoading(true);

    postForgotPassword(email)
      .then((res) => {
        setError("Código reenviado");
        setMessage(res.data.detail);
        setStatus(res.data.email.status);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };
  return (
    <div className="flex box-xxl column j-center a-center border-radius-xxs base-border padding-xs">
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
        {status === "default" && <h1>¿Olvidaste tu contraseña?</h1>}
        {status === "waiting" && (
          <>
            <h1>Verifica tu identidad e ingresa una nueva contraseña</h1>
            <h3>{email}</h3>
          </>
        )}
        <button className="btn-span" onClick={() => handleBackLogin()}>
          <h5>Volver al ingreso</h5>
        </button>
        {status === "waiting" && (
          <button onClick={() => resendVerifyCode()} className="btn-span">
            <h5>Reenviar código</h5>
          </button>
        )}
      </div>

      {loading && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <Image className="f-height-xxs" src={loadingGif} alt="Cargando..." />
        </div>
      )}
      {error && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <h4>{error}</h4>
        </div>
      )}

      {status === "default" && (
        <form
          id="forgot-password-form"
          onSubmit={(e) => onSubmitForgotPassword(e)}
          action="#"
          encType="multipart/form-data"
          className="flex box-xxl wrap a-center j-center margin-t-xxs"
        >
          <div className="flex box-xxl column gap-xxs padding-xs margin-b-xxs">
            <h4>Ingresa el correo registrado</h4>

            <input
              className="input-large"
              onChange={(e) => onChange(e)}
              type="email"
              id="email"
              name="email"
              value={email}
              placeholder="Ingresa el correo registrado"
              readOnly={loading}
              required
            />
          </div>
          <div className="flex box-xxl column a-center padding-xxs margin-t-xxs">
            <button
              form="forgot-password-form"
              type="submit"
              className="btn-middle btn-active"
              disabled={loading}
            >
              Enviar
            </button>
          </div>
        </form>
      )}
      {status === "waiting" && (
        <form
          id="new-password-code-form"
          onSubmit={(e) => onSubmitForgotPasswordConfirm(e)}
          action="#"
          encType="multipart/form-data"
          className="box-xxl box-column box-center margin-top"
        >
          <div className="flex box-xxl column gap-xxs padding-xs margin-b-xxs">
            <h4>Ingresa el código de verificación</h4>
            <input
              className="input-large"
              onChange={(e) => onChange(e)}
              type="text"
              id="code"
              name="code"
              value={code}
              placeholder="Ingresa el código de verificación"
              readOnly={loading}
              required
            />
          </div>
          <div className="flex box-xxl column gap-xxs padding-xs margin-b-xxs">
            <h4>Ingresa una nueva contraseña</h4>

            <input
              className="input-large"
              onChange={(e) => onChange(e)}
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              placeholder="Ingresa una nueva contraseña"
              readOnly={loading}
              required
            />
          </div>
          <div className="flex box-xxl column gap-xxs padding-xs margin-b-xxs">
            <h4>Repite la nueva contraseña</h4>

            <input
              className="input-large"
              onChange={(e) => onChange(e)}
              type="password"
              id="reNewPassword"
              name="reNewPassword"
              value={reNewPassword}
              placeholder="Repite la nueva contraseña"
              readOnly={loading}
              required
            />
          </div>
          <div className="flex box-xxl column a-center padding-xxs margin-t-xxs">
            <button
              form="new-password-code-form"
              type="submit"
              className="btn-middle btn-active"
              disabled={loading}
            >
              Guardar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
