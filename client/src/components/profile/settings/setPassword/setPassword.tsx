"use client";
// setPassword.tsx

import { useAuth } from "../../../../context/auth/authContext";
import { useMessages } from "../../../../context/messages/messagesContext";
import { useModal } from "../../../../context/modal/modalContext";
import { useSettings } from "../../../../context/settings/settingsContext";
import { ChangeEvent, FormEvent, useState } from "react";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import Image from "next/image";
import { postSetPassword } from "./api/action";

export default function SetPassword() {
  const { firebaseUser, user, signOutAuthState } = useAuth();
  const { addMessage } = useMessages();

  const { closeModal, openModal, setMessage } = useModal();
  const { syncProviders } = useSettings();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [setPasswordFormdata, setSetPasswordFormData] = useState({
    newPassword: "",
    reNewPassword: "",
  });

  const { newPassword, reNewPassword } = setPasswordFormdata;

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSetPasswordFormData({
      ...setPasswordFormdata,
      [e.target.name]: e.target.value,
    });

  const onSubmitSetPassword = (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    if (!firebaseUser) {
      signOutAuthState("Unexpected error, please log in again", true, false);
      return;
    }
    if (!user?.email) {
      signOutAuthState("Unexpected error, please log in again", true, false);
      return;
    }

    postSetPassword(
      newPassword,
      reNewPassword,
      firebaseUser,
      user?.email,

      syncProviders,

      signOutAuthState
    )
      .then((res) => {
        addMessage(res.data.detail);

        setLoading(false);

        closeModal();
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  return (
    <div className="flex box-xxl column j-center a-center border-radius-xxs base-border padding-xs">
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
        <h1>Create your password</h1>
        <h3>{`${user?.email}`}</h3>
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

      <form
        id="set-password-form"
        onSubmit={(e) => onSubmitSetPassword(e)}
        action="#"
        encType="multipart/form-data"
        className="flex box-xxl wrap a-center j-center margin-t-xxs"
      >
        <div className="flex box-xxl column gap-xxs padding-xs margin-b-xxs">
          <h4>Enter the new password</h4>
          <input
            className="input-large"
            onChange={(e) => onChange(e)}
            type="password"
            id="newPassword"
            name="newPassword"
            value={newPassword}
            placeholder="Enter the new password"
            readOnly={loading}
            required
          />
        </div>
        <div className="flex box-xxl column gap-xxs padding-xs margin-b-xxs">
          <h4>Repeat the new password</h4>
          <input
            className="input-large"
            onChange={(e) => onChange(e)}
            type="password"
            id="reNewPassword"
            name="reNewPassword"
            value={reNewPassword}
            placeholder="Repeat the new password"
            readOnly={loading}
            required
          />
        </div>
        <div className="flex box-xxl column a-center padding-xxs margin-t-xxs">
          <button
            form="set-password-form"
            type="submit"
            className="btn-middle btn-active"
            disabled={loading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
