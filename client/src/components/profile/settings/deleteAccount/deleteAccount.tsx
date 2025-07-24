"use client";
// deleteAccount.tsx

import "./deleteAccount.css";
import { ChangeEvent, FormEvent, useState } from "react";
import { useAuth } from "../../../../context/auth/authContext";
import { useModal } from "../../../../context/modal/modalContext";
import { postDeleteAccount, postDeleteAccountConfirm } from "./api/action";
import { useMessages } from "../../../../context/messages/messagesContext";
import Image from "next/image";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import { useRouter } from "next/navigation";
import { postResendVerifyCode } from "../../../../components/api/action";
import { useFirebase } from "../../../../context/firebase/firebaseContext";

export default function DeleteAccount() {
  const { auth } = useFirebase();
  const { user, signOutAuthState } = useAuth();
  const { closeModal, setMessage } = useModal();
  const { addMessage } = useMessages();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [status, setStatus] = useState<string>("waitingConfirm");

  const [deleteAccountFormdata, setDeleteAccountFormData] = useState({
    code: "",
  });

  const { code } = deleteAccountFormdata;

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setDeleteAccountFormData({
      ...deleteAccountFormdata,
      [e.target.name]: e.target.value,
    });

  const router = useRouter();

  const notDelete = () => {
    setError(null);
    setLoading(false);
    closeModal();
  };
  const yesDelete = () => {
    setError(null);
    setLoading(true);

    postDeleteAccount(signOutAuthState)
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

  const sendDeleteCode = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    postDeleteAccountConfirm(code, signOutAuthState)
      .then((res) => {
        signOutAuthState();
        addMessage(res.data.detail);
        closeModal();
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  const resendVerifyCode = () => {
    setError(null);
    setLoading(true);

    let user = auth.currentUser;
    postResendVerifyCode(user)
      .then(() => {
        setError("Forwarded code");
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  return (
    <div className="flex box-xxl column j-center a-center border-radius-xxs base-border padding-xs">
      <div className="flex box-xxl m-height-xxs column gap-xxs a-start j-center padding-xs base-border-b">
        {status === "waitingConfirm" && (
          <h1>Are you sure you want to delete your account?</h1>
        )}
        {status === "waitingCode" && (
          <h1>
            Irreversible action, you will not be able to recover your account.
          </h1>
        )}
        <h3>{user?.email}</h3>
        {status === "waitingCode" && (
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

      {status === "waitingConfirm" && (
        <div id="confirm-form" className="flex padding-t-s gap-m">
          <button
            onClick={() => notDelete()}
            className="btn-small btn-active"
            disabled={loading}
          >
            No
          </button>
          <button
            onClick={() => yesDelete()}
            className="btn-small btn-active"
            disabled={loading}
          >
            Yes
          </button>
        </div>
      )}
      {status === "waitingCode" && (
        <form
          id="code-form"
          onSubmit={(e) => sendDeleteCode(e)}
          action="#"
          encType="multipart/form-data"
          className="flex box-xxl wrap a-center j-center margin-t-xxs"
        >
          <div className="flex box-xxl column gap-xxs padding-xs margin-b-xxs">
            <h4>Enter the confirmation code</h4>
            <input
              className="input-large"
              onChange={(e) => onChange(e)}
              type="text"
              id="code"
              name="code"
              value={code}
              placeholder="Enter the confirmation code"
              readOnly={loading}
              maxLength={6}
              required
            />
          </div>
          <div className="flex box-xxl column a-center padding-xxs margin-t-xxs">
            <button
              form="code-form"
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
