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
        {status === "default" && <h1>Forgot your password?</h1>}
        {status === "waiting" && (
          <>
            <h1>Verify your identity and enter your new password</h1>
            <h3>{email}</h3>
          </>
        )}
        <button className="btn-span" onClick={() => handleBackLogin()}>
          <h5>Back to login</h5>
        </button>
        {status === "waiting" && (
          <button onClick={() => resendVerifyCode()} className="btn-span">
            <h5>Resend code</h5>
          </button>
        )}
      </div>

      {loading && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <Image className="f-height-xxs" src={loadingGif} alt="Loading..." />
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
            <h4>Enter your registration email</h4>

            <input
              className="input-large"
              onChange={(e) => onChange(e)}
              type="email"
              id="email"
              name="email"
              value={email}
              placeholder="Enter your registration email"
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
              Send
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
            <h4>Enter verification code</h4>
            <input
              className="input-large"
              onChange={(e) => onChange(e)}
              type="text"
              id="code"
              name="code"
              value={code}
              placeholder="Enter verification code"
              readOnly={loading}
              required
            />
          </div>
          <div className="flex box-xxl column gap-xxs padding-xs margin-b-xxs">
            <h4>Enter new password</h4>

            <input
              className="input-large"
              onChange={(e) => onChange(e)}
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              placeholder="Enter new password"
              readOnly={loading}
              required
            />
          </div>
          <div className="flex box-xxl column gap-xxs padding-xs margin-b-xxs">
            <h4>Repeat new password</h4>

            <input
              className="input-large"
              onChange={(e) => onChange(e)}
              type="password"
              id="reNewPassword"
              name="reNewPassword"
              value={reNewPassword}
              placeholder="Repeat new password"
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
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
