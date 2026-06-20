"use client";
// verifyEmail.tsx

//import "../auth.css";
import { ChangeEvent, FormEvent, useState } from "react";
import { postVerifyEmailNumber } from "./api/action";
import { useFirebase } from "../../../context/firebase/firebaseContext";
import { useModal } from "../../../context/modal/modalContext";
import { useMessages } from "../../../context/messages/messagesContext";
import { useAuth } from "../../../context/auth/authContext";
import Image from "next/image";
import loadingGif from "../../../assets/cargando/loading2.gif";
import { postResendVerifyCode } from "../../../components/api/action";

export default function VerifyEmail() {
  const { auth } = useFirebase();
  const { updateAuthState, signOutAuthState } = useAuth();
  const { openModal, closeModal } = useModal();
  const { addMessage } = useMessages();

  //const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [verifyEmailFormData, setVerifyEmailFormData] = useState({
    verifyEmailNumber: "",
  });

  const { verifyEmailNumber } = verifyEmailFormData;

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setVerifyEmailFormData({
      ...verifyEmailFormData,
      [e.target.name]: e.target.value,
    });

  const sendConfirmNumber = (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    //setInfo("Verificando usuario, por favor espera");
    setLoading(true);

    let user = auth.currentUser;

    user?.getIdToken(false).then((idToken) => {
      let token = idToken;
      let email = "";
      if (user.email) {
        email = user.email;
      }
      setTimeout(() => {
        postVerifyEmailNumber(token, user.uid, verifyEmailNumber)
          .then((res) => {
            if (res.data.email.status === "waitingConfirmCode") {
              openModal("verifyEmail", res.data.detail);
            } else if (res.data.email.status === "notLogged") {
              signOutAuthState();
              openModal("login", res.data.detail);
            } else {
              updateAuthState(
                res.data.user,
                res.data.tokens.access,
                res.data.tokens.refresh
              );
              addMessage(res.data.detail);
              closeModal();
            }
            setLoading(false);
            /*if (res.data.email.status === "waitingConfirmCode") {
              openModal("verifyEmail", res.data.detail);
            } else if (res.data.email.status === "notLogged") {
              signOutAuthState();
              if (pathname.includes("/auth")) {
                closeModal();
                addMessage(res.data.detail);
                router.push("/auth/login");
              } else {
                openModal("login", res.data.detail);
              }
            } else {
              updateAuthState(
                res.data.user,
                res.data.tokens.access,
                res.data.tokens.refresh
              );

              addMessage(res.data.detail);

              closeModal();

              if (auth.currentUser && pathname.includes("/auth")) {
                router.push("/profile");
              }
            }*/
          })
          .catch((err) => {
            //setInfo(null);
            setError(err);
            setLoading(false);
          });
      }, 3000);
    });
  };

  const resendVerifyCode = () => {
    setError(null);
    setLoading(true);

    let user = auth.currentUser;
    postResendVerifyCode(user)
      .then(() => {
        setError("Código de verificación reenviado");
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
        <h1>Verificación de correo</h1>

        <button onClick={() => resendVerifyCode()} className="btn-span">
          <h5>Reenviar código de verificación</h5>
        </button>
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

      <form
        id="verify-email-form"
        onSubmit={(e) => sendConfirmNumber(e)}
        action="#"
        encType="multipart/form-data"
        className="flex box-xxl wrap a-center j-center margin-t-xxs"
      >
        <div className="flex box-xxl column gap-xxs padding-xs margin-b-xxs">
          <h4>Código de verificación</h4>

          <input
            className="input-large"
            onChange={(e) => onChange(e)}
            type="text"
            id="verifyEmailNumber"
            name="verifyEmailNumber"
            value={verifyEmailNumber}
            maxLength={6}
            placeholder="Ingresa tu código de verificación"
            readOnly={loading}
            required
          />
        </div>
        <div className="flex box-xxl column a-center padding-xxs margin-t-xxs">
          <button
            form="verify-email-form"
            type="submit"
            className="btn-middle btn-active"
            disabled={loading}
          >
            Verificar
          </button>
        </div>
      </form>
    </div>
  );
}
