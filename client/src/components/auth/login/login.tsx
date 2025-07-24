"use client";
// login.tsx

//import "../auth.css";
import { ChangeEvent, FormEvent, useState } from "react";
import { postFirebaseLogin } from "./api/action";
import { useModal } from "../../../context/modal/modalContext";
import { useFirebase } from "../../../context/firebase/firebaseContext";
import { useMessages } from "../../../context/messages/messagesContext";
import { useAuth } from "../../../context/auth/authContext";
import { useSettings } from "../../../context/settings/settingsContext";
import Image from "next/image";
import loadingGif from "../../../assets/cargando/loading2.gif";
import { useMobile } from "../../../context/mobile/mobileContext";

export default function Login() {
  const { device } = useMobile();
  const { updateAuthState, setAuthType, signOutAuthState } = useAuth();

  const { auth } = useFirebase();
  const { linkedProviders } = useSettings();

  const { openModal, closeModal } = useModal();
  const { addMessage } = useMessages();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDontHaveAccount = () => {
    openModal("register", null);
  };

  const handleForgotPassword = () => {
    console.log("Forgot password");
    openModal(
      "forgotPassword",
      "If the email you entered is found, we will send a verification number to your email to reset your password"
    );
  };

  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = loginFormData;

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });

  const onClickProvider = async (currentProvider: string, e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);
    setAuthType(currentProvider);

    console.log("Login with provider: " + currentProvider);

    postFirebaseLogin(auth, email, password, currentProvider)
      .then((res) => {
        console.log(res);
        if (res.data.email.status === "waitingConfirmCode") {
          openModal("verifyEmail", res.data.detail);
        } else if (res.data.email.status === "notLogged") {
          signOutAuthState();
          setError(res.data.detail);
        } else if (res.data.email.status === "notRegistered") {
          signOutAuthState();
          openModal("register", res.data.detail);
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
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  return (
    <div className="flex box-xxl column j-center a-center border-radius-xxs base-border padding-xs">
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
        <h1>E-commerce Web Login</h1>
        <button
          className="btn-span"
          onClick={() => handleDontHaveAccount()}
          disabled={loading}
        >
          <h5>Don't have an account? Register here</h5>
        </button>
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
      <div
        className={`flex box-xxl ${
          device < 3 ? "column" : ""
        } a-center j-center padding-s margin-t-xxs`}
      >
        <h2
          className={`flex ${device < 3 ? "box-xxl j-center" : "box-m j-end"}`}
        >
          Access with
        </h2>
        <div className={`flex ${device < 3 ? "box-xxl j-center" : "box-m"}`}>
          {linkedProviders &&
            linkedProviders.map((provider, index) => (
              <div key={index}>
                {provider.providerId !== "password" && (
                  <form
                    id={`${provider.providerId}-register-form`}
                    onSubmit={(e) => onClickProvider(provider.providerId, e)}
                    action="#"
                    encType="multipart/form-data"
                    className="padding-xxs"
                  >
                    <button
                      form={`${provider.providerId}-register-form`}
                      type="submit"
                      className="btn-small btn-active"
                      disabled={loading}
                    >
                      {provider.icon}
                    </button>
                  </form>
                )}
              </div>
            ))}
        </div>
      </div>

      <form
        id="login-form"
        onSubmit={(e) => onClickProvider("password", e)}
        action="#"
        encType="multipart/form-data"
        className={`flex ${
          device < 1 ? "column" : "wrap"
        } box-xxl a-center j-center`}
      >
        <div
          className={`flex ${
            device > 1 ? "box-m" : device < 1 ? "box-xxl" : "box-m"
          } column gap-xxs padding-xs margin-b-xxs`}
        >
          <h4>Email</h4>

          <input
            className="input-large"
            onChange={(e) => onChange(e)}
            type="email"
            id="email"
            name="email"
            value={email}
            placeholder="Enter your email"
            readOnly={loading}
            required
          />
        </div>

        <div
          className={`flex ${
            device > 1 ? "box-m" : device < 1 ? "box-xxl" : "box-m"
          } column gap-xxs padding-xs margin-b-xxs`}
        >
          <h4>Password</h4>

          <input
            className="input-large"
            onChange={(e) => onChange(e)}
            type="password"
            id="password"
            name="password"
            value={password}
            placeholder="Enter your password"
            readOnly={loading}
            required
          />
        </div>
        <div className="flex box-xxl column a-end margin-t-xxs">
          <button
            className="btn-span"
            form="none"
            onClick={() => handleForgotPassword()}
            disabled={loading}
          >
            <h5>Forgot your password? Recover it here</h5>
          </button>
        </div>

        <div className="flex box-xxl column a-center padding-xxs margin-t-xxs">
          <button
            form="login-form"
            type="submit"
            disabled={loading}
            className="btn-middle btn-active"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
