"use client";
// changeEmail.tsx

// import "./changeEmail.css";
import { ChangeEvent, FormEvent, useState } from "react";
import { useAuth } from "../../../../context/auth/authContext";
import { postChangeEmail, postChangeEmailCode } from "./api/action";
import { useModal } from "../../../../context/modal/modalContext";
import Image from "next/image";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import { useMessages } from "../../../../context/messages/messagesContext";
import { useRouter } from "next/navigation";
import { useFirebase } from "../../../../context/firebase/firebaseContext";

export default function ChangeEmail() {
  const { auth } = useFirebase();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [status, setStatus] = useState<string>("waitingNewEmail");

  const { signOutAuthState } = useAuth();
  const { setMessage, openModal } = useModal();

  const { addMessage } = useMessages();

  const router = useRouter();

  const [changeEmailFormdata, setChangeEmailFormData] = useState({
    newEmail: "",
    code: "",
  });

  const { newEmail, code } = changeEmailFormdata;

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setChangeEmailFormData({
      ...changeEmailFormdata,
      [e.target.name]: e.target.value,
    });

  const onSubmitNewEmail = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    postChangeEmail(newEmail, signOutAuthState)
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
  const onSubmitCode = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    postChangeEmailCode(code, signOutAuthState)
      .then((res) => {
        setLoading(false);

        signOutAuthState();

        openModal("login", res.data.detail);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  const resendVerifyCode = () => {
    setError(null);
    setLoading(true);

    postChangeEmail(newEmail, signOutAuthState)
      .then((res) => {
        setError("Forwarded code");
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
      <div className="flex box-xxl m-height-xxs column gap-xxs a-start j-center padding-xs base-border-b">
        <h1>Changing email</h1>
        <h3>
          {status === "waitingNewEmail" &&
            `Tendrás que volver a iniciar sesión`}
        </h3>
        <h3>{status === "waitingCode" && `Nuevo: ${newEmail}`}</h3>
        {status !== "waitingNewEmail" && (
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

      {status === "waitingNewEmail" && (
        <form
          id="new-email-form"
          onSubmit={(e) => onSubmitNewEmail(e)}
          action="#"
          encType="multipart/form-data"
          className="flex box-xxl wrap a-center j-center margin-t-xxs"
        >
          <div className="flex box-xxl column gap-xxs padding-xs margin-b-xxs">
            <h4>Enter your new email</h4>
            <input
              className="input-large"
              onChange={(e) => onChange(e)}
              type="email"
              id="newEmail"
              name="newEmail"
              value={newEmail}
              placeholder="Enter your new email"
              readOnly={loading}
              required
            />
          </div>
          <div className="flex box-xxl column a-center padding-xxs margin-t-xxs">
            <button
              form="new-email-form"
              type="submit"
              className="btn-middle btn-active"
              disabled={loading}
            >
              Send
            </button>
          </div>
        </form>
      )}
      {status === "waitingCode" && (
        <form
          id="code-form"
          onSubmit={(e) => onSubmitCode(e)}
          action="#"
          encType="multipart/form-data"
          className="flex box-xxl wrap a-center j-center margin-t-xxs"
        >
          <div className="flex box-xxl column gap-xxs padding-xs margin-b-xxs">
            <h4>Enter the verification code</h4>
            <input
              className="input-large"
              onChange={(e) => onChange(e)}
              type="text"
              id="code"
              name="code"
              value={code}
              placeholder="Enter the verification code"
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
