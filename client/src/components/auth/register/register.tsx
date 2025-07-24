"use client";
// register.tsx

//import "../auth.css";
import { useFirebase } from "../../../context/firebase/firebaseContext";
import { ChangeEvent, FormEvent, useState } from "react";
import { postFirebaseRegister } from "./api/action";
import { useModal } from "../../../context/modal/modalContext";
import { useMessages } from "../../../context/messages/messagesContext";
import { useAuth } from "../../../context/auth/authContext";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useSettings } from "../../../context/settings/settingsContext";
import Image from "next/image";
import loadingGif from "../../../assets/cargando/loading2.gif";
import { useMobile } from "../../../context/mobile/mobileContext";

export default function Register() {
  const { device } = useMobile();
  const { updateAuthState, setAuthType, signOutAuthState } = useAuth();

  const { auth } = useFirebase();
  const { linkedProviders } = useSettings();

  const { openModal, closeModal } = useModal();
  const { addMessage } = useMessages();

  //const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAlreadyHaveAccount = () => {
    openModal("login", null);
  };

  const [registerFormData, setRegisterFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    rut: "",
    phone: "",
    password: "",
    re_password: "",
  });

  const {
    username,
    email,
    first_name,
    last_name,
    rut,
    phone,
    password,
    re_password,
  } = registerFormData;

  type E164Number = string;

  const onChange = (
    e: ChangeEvent<HTMLInputElement> | E164Number | undefined
  ) => {
    if (typeof e === "string" || typeof e === "undefined") {
      if (typeof e === "undefined") {
        setRegisterFormData({ ...registerFormData, phone: "" });
      } else {
        setRegisterFormData({ ...registerFormData, phone: e });
      }
    } else if (e && e.target) {
      setRegisterFormData({
        ...registerFormData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const onClickProvider = async (currentProvider: string, e: FormEvent) => {
    e.preventDefault();

    setError(null);
    //setInfo("Registrando usuario, por favor espera");
    setLoading(true);

    setAuthType(currentProvider);

    console.log("Register with provider: " + currentProvider);

    postFirebaseRegister(
      auth,
      username,
      email,
      first_name,
      last_name,
      rut,
      phone,
      password,
      re_password,
      currentProvider
    )
      .then((res) => {
        console.log(res);
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
      })
      .catch((err) => {
        //setInfo(null);
        setError(err);
        setLoading(false);
      });
    //dispatch(postFirebaseRegister(email, first_name ,last_name, rut, password, re_password, currentProvider));
  };

  return (
    <div className="flex box-xxl column j-center a-center border-radius-xxs base-border padding-xs">
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
        <h1>E-commerce Web Registration</h1>
        <button
          className="btn-span"
          onClick={() => handleAlreadyHaveAccount()}
          disabled={loading}
        >
          <h5>Already have an account? Login here</h5>
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
          Register with
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
        id="register-form"
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
          <h4>Username</h4>
          <input
            className="input-large"
            onChange={(e) => onChange(e)}
            type="username"
            id="username"
            name="username"
            value={username}
            placeholder="Enter your username"
            readOnly={loading}
            required
          />
        </div>
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
          <h4>Name</h4>
          <input
            className="input-large"
            onChange={(e) => onChange(e)}
            type="text"
            id="first_name"
            name="first_name"
            value={first_name}
            placeholder="Enter your name"
            readOnly={loading}
            required
          />
        </div>
        <div
          className={`flex ${
            device > 1 ? "box-m" : device < 1 ? "box-xxl" : "box-m"
          } column gap-xxs padding-xs margin-b-xxs`}
        >
          <h4>Last name</h4>
          <input
            className="input-large"
            onChange={(e) => onChange(e)}
            type="text"
            id="last_name"
            name="last_name"
            value={last_name}
            placeholder="Enter your last name"
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
        <div
          className={`flex ${
            device > 1 ? "box-m" : device < 1 ? "box-xxl" : "box-m"
          } column gap-xxs padding-xs margin-b-xxs`}
        >
          <h4>Repeat your password</h4>
          <input
            className="input-large"
            onChange={(e) => onChange(e)}
            type="password"
            id="re_password"
            name="re_password"
            value={re_password}
            placeholder="Repeat your password"
            readOnly={loading}
            required
          />
        </div>
        <div
          className={`flex ${
            device > 1 ? "box-m" : device < 1 ? "box-xxl" : "box-m"
          } column gap-xxs padding-xs margin-b-xxs`}
        >
          <h4>Phone number</h4>
          <PhoneInput
            placeholder="Enter your phone number"
            name="phone"
            id="phone"
            value={phone}
            onChange={(e) => onChange(e)}
            defaultCountry="CL"
            disabled={loading}
          />
        </div>
        <div
          className={`flex ${
            device > 1 ? "box-m" : device < 1 ? "box-xxl" : "box-m"
          } column gap-xxs padding-xs margin-b-xxs`}
        >
          <h4>RUT/DNI [optional]</h4>

          <input
            className="input-large"
            onChange={(e) => onChange(e)}
            type="text"
            id="rut"
            name="rut"
            value={rut}
            placeholder="Enter an identification number (RUT) without dots or dashes"
            readOnly={loading}
          />
        </div>
        <div className="flex box-xxl column a-center padding-xxs margin-t-xxs">
          <button
            form="register-form"
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
