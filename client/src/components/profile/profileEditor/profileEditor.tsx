"use client";
// profileEditor.tsx

import { useAuth } from "../../../context/auth/authContext";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FaRegSave, FaEdit } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
// import "./profileEditor.css";
import { postProfileEditor } from "./api/action";
import { useMessages } from "../../../context/messages/messagesContext";
import Image from "next/image";
import loadingGif from "../../../assets/cargando/loading2.gif";
import { useRouter } from "next/navigation";
import { useModal } from "../../../context/modal/modalContext";
import { useMobile } from "../../../context/mobile/mobileContext";

export default function ProfileEditor() {
  const { device } = useMobile();
  const { user, setUser, signOutAuthState, isAuthenticated } = useAuth();

  const { openModal } = useModal();

  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      openModal("login", "You must be authenticated to continue");
    }
  }, [isAuthenticated]);

  const { addMessage } = useMessages();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [editorOpened, setEditorOpened] = useState({
    username_editor: false,
    first_name_editor: false,
    last_name_editor: false,
    rut_editor: false,
    phone_editor: false,
  });

  const {
    username_editor,
    first_name_editor,
    last_name_editor,
    rut_editor,
    phone_editor,
  } = editorOpened;

  const [editorFormData, setEditorFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    rut: "",
    phone: "",
  });

  const { username, first_name, last_name, rut, phone } = editorFormData;

  const openEditor = (param: string) => {
    setError(null);

    if (param === "username") {
      setEditorFormData({
        ...editorFormData,
        username: user?.username ? user.username : "",
      });
    }

    if (param === "first_name") {
      setEditorFormData({
        ...editorFormData,
        first_name: user?.first_name ? user.first_name : "",
      });
    }
    if (param === "last_name") {
      setEditorFormData({
        ...editorFormData,
        last_name: user?.last_name ? user.last_name : "",
      });
    }
    if (param === "rut") {
      setEditorFormData({ ...editorFormData, rut: user?.rut ? user.rut : "" });
    }
    if (param === "phone") {
      setEditorFormData({
        ...editorFormData,
        phone: user?.phone ? user.phone : "",
      });
    }

    let editorParam = `${param}_editor`;
    for (let key in editorOpened) {
      if (key !== editorParam) {
        setEditorOpened((prevState) => ({ ...prevState, [key]: false }));
      } else {
        setEditorOpened((prevState) => ({ ...prevState, [key]: true }));
      }
    }
  };

  type E164Number = string;

  const onChange = (
    e: ChangeEvent<HTMLInputElement> | E164Number | undefined
  ) => {
    if (typeof e === "string" || typeof e === "undefined") {
      if (typeof e === "undefined") {
        setEditorFormData({ ...editorFormData, phone: "" });
      } else {
        setEditorFormData({ ...editorFormData, phone: e });
      }
    } else if (e && e.target) {
      setEditorFormData({ ...editorFormData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = (param: string, e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    let value: string = "";

    if (param === "username") {
      value = username;
      if (value === user?.username) {
        setError("Enter a username different from the current one");
        setLoading(false);
        return;
      }
    }

    if (param === "first_name") {
      value = first_name;
      if (value === user?.first_name) {
        setError("Enter a name other than the current one");
        setLoading(false);
        return;
      }
    }
    if (param === "last_name") {
      value = last_name;
      if (value === user?.last_name) {
        setError("Enter a last name different from the current one");
        setLoading(false);
        return;
      }
    }
    if (param === "rut") {
      value = rut;
      if (value === user?.rut) {
        setError("Enter a RUT/DNI different from the current one");
        setLoading(false);
        return;
      }
    }
    if (param === "phone") {
      value = phone;
      if (value === user?.phone) {
        setError("Enter a cell phone number other than the current one");
        setLoading(false);
        return;
      }
    }

    postProfileEditor(param, value, signOutAuthState)
      .then((res) => {
        setUser(res.data.user);

        setEditorOpened({ ...editorOpened, [`${param}_editor`]: false });

        addMessage("Updated profile");

        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  const formatRUTString = (rut: string) => {
    // Eliminar caracteres no numéricos
    rut = rut.replace(/[^\d]/g, "");

    // Separar el cuerpo y el dígito verificador
    const cuerpo = rut.slice(0, -1);
    const digitoVerificador = rut.slice(-1).toUpperCase();

    // Formatear el cuerpo con puntos y el dígito verificador
    return (
      cuerpo.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + "-" + digitoVerificador
    );
  };

  return (
    <div className="flex box-xxl wrap j-center a-start">
      {isAuthenticated && user && (
        <>
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
            <h1>Personal information</h1>
          </div>
          {loading && (
            <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
              <Image
                className="f-height-xxs"
                src={loadingGif}
                alt="Loading..."
              />
            </div>
          )}
          {error && (
            <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
              <h4>{error}</h4>
            </div>
          )}
          <div className="flex box-xxl wrap a-center j-center padding-l-xs padding-r-xs">
            {!username_editor ? (
              <div className="flex box-xxl padding-s base-border-b">
                <div className="flex box-l column a-start j-center gap-xxs">
                  <h4>Username</h4>
                  <h4>{user?.username}</h4>
                </div>
                <div className="flex box-s a-end j-end gap-s">
                  <button
                    onClick={() => openEditor("username")}
                    disabled={loading}
                    className="btn-small btn-active"
                  >
                    <FaEdit className="zoom-out-xxl" />
                  </button>
                </div>
              </div>
            ) : (
              <form
                id="first-name-form"
                onSubmit={(e) => onSubmit("username", e)}
                action="#"
                encType="multipart/form-data"
                className="flex box-xxl wrap padding-s base-border-b"
              >
                <div
                  className={`flex ${
                    device > 2 ? "box-l" : "box-xxl"
                  } column a-start j-center gap-xxs`}
                >
                  <h4>Username</h4>
                  <input
                    className="input-large"
                    onChange={(e) => onChange(e)}
                    type="text"
                    name="username"
                    id="username"
                    value={username}
                    placeholder="Enter your username"
                    readOnly={loading}
                    required
                  />
                </div>
                <div
                  className={`flex ${
                    device > 2 ? "box-s" : "box-xxl padding-t-s"
                  } a-end j-end gap-s`}
                >
                  <button
                    form="none"
                    className="btn-small btn-active"
                    disabled={loading}
                    onClick={() => {
                      setEditorOpened({
                        ...editorOpened,
                        username_editor: false,
                      });
                      setError(null);
                    }}
                  >
                    <IoIosCloseCircle className="zoom-out-xxl" />
                  </button>
                  <button
                    form="first-name-form"
                    disabled={loading}
                    type="submit"
                    className="btn-small btn-active"
                  >
                    <FaRegSave className="zoom-out-xxl" />
                  </button>
                </div>
              </form>
            )}

            {!first_name_editor ? (
              <div className="flex box-xxl padding-s base-border-b">
                <div className="flex box-l column a-start j-center gap-xxs">
                  <h4>Name</h4>
                  <h4>{user?.first_name}</h4>
                </div>
                <div className="flex box-s a-end j-end gap-s">
                  <button
                    onClick={() => openEditor("first_name")}
                    disabled={loading}
                    className="btn-small btn-active"
                  >
                    <FaEdit className="zoom-out-xxl" />
                  </button>
                </div>
              </div>
            ) : (
              <form
                id="first-name-form"
                onSubmit={(e) => onSubmit("first_name", e)}
                action="#"
                encType="multipart/form-data"
                className="flex box-xxl wrap padding-s base-border-b"
              >
                <div
                  className={`flex ${
                    device > 2 ? "box-l" : "box-xxl"
                  } column a-start j-center gap-xxs`}
                >
                  <h4>Name</h4>
                  <input
                    className="input-large"
                    onChange={(e) => onChange(e)}
                    type="text"
                    name="first_name"
                    id="first_name"
                    value={first_name}
                    placeholder="Enter your name"
                    readOnly={loading}
                    required
                  />
                </div>
                <div
                  className={`flex ${
                    device > 2 ? "box-s" : "box-xxl padding-t-s"
                  } a-end j-end gap-s`}
                >
                  <button
                    form="none"
                    className="btn-small btn-active"
                    disabled={loading}
                    onClick={() => {
                      setEditorOpened({
                        ...editorOpened,
                        first_name_editor: false,
                      });
                      setError(null);
                    }}
                  >
                    <IoIosCloseCircle className="zoom-out-xxl" />
                  </button>
                  <button
                    form="first-name-form"
                    disabled={loading}
                    type="submit"
                    className="btn-small btn-active"
                  >
                    <FaRegSave className="zoom-out-xxl" />
                  </button>
                </div>
              </form>
            )}
            {!last_name_editor ? (
              <div className="flex box-xxl padding-s base-border-b">
                <div className="flex box-l column a-start j-center gap-xxs">
                  <h4>Last name</h4>
                  <h4>{user?.last_name}</h4>
                </div>
                <div className="flex box-s a-end j-end gap-s">
                  <button
                    onClick={() => openEditor("last_name")}
                    disabled={loading}
                    className="btn-small btn-active"
                  >
                    <FaEdit className="zoom-out-xxl" />
                  </button>
                </div>
              </div>
            ) : (
              <form
                id="last-name-form"
                onSubmit={(e) => onSubmit("last_name", e)}
                action="#"
                encType="multipart/form-data"
                className="flex box-xxl wrap padding-s base-border-b"
              >
                <div
                  className={`flex ${
                    device > 2 ? "box-l" : "box-xxl"
                  } column a-start j-center gap-xxs`}
                >
                  <h4>Last name</h4>
                  <input
                    className="input-large"
                    onChange={(e) => onChange(e)}
                    type="text"
                    name="last_name"
                    id="last_name"
                    value={last_name}
                    placeholder="Enter your last name"
                    readOnly={loading}
                    required
                  />
                </div>
                <div
                  className={`flex ${
                    device > 2 ? "box-s" : "box-xxl padding-t-s"
                  } a-end j-end gap-s`}
                >
                  <button
                    form="none"
                    className="btn-small btn-active"
                    disabled={loading}
                    onClick={() => {
                      setEditorOpened({
                        ...editorOpened,
                        last_name_editor: false,
                      });
                      setError(null);
                    }}
                  >
                    <IoIosCloseCircle className="zoom-out-xxl" />
                  </button>
                  <button
                    form="last-name-form"
                    disabled={loading}
                    type="submit"
                    className="btn-small btn-active"
                  >
                    <FaRegSave className="zoom-out-xxl" />
                  </button>
                </div>
              </form>
            )}

            {!rut_editor ? (
              <div className="flex box-xxl padding-s base-border-b">
                <div className="flex box-l column a-start j-center gap-xxs">
                  <h4>Identification number (RUT/DNI)</h4>
                  <h4>
                    {user?.rut ? formatRUTString(user.rut) : "No asignado"}
                  </h4>
                </div>
                <div className="flex box-s a-end j-end gap-s">
                  <button
                    onClick={() => openEditor("rut")}
                    disabled={loading}
                    className="btn-small btn-active"
                  >
                    <FaEdit className="zoom-out-xxl" />
                  </button>
                </div>
              </div>
            ) : (
              <form
                id="rut-form"
                onSubmit={(e) => onSubmit("rut", e)}
                action="#"
                encType="multipart/form-data"
                className="flex box-xxl wrap padding-s base-border-b"
              >
                <div
                  className={`flex ${
                    device > 2 ? "box-l" : "box-xxl"
                  } column a-start j-center gap-xxs`}
                >
                  <h4>Identification number (RUT/DNI)</h4>
                  <input
                    className="input-large"
                    onChange={(e) => onChange(e)}
                    type="text"
                    name="rut"
                    id="rut"
                    value={rut}
                    placeholder="Enter your identification number (RUT/DNI)"
                    readOnly={loading}
                  />
                </div>
                <div
                  className={`flex ${
                    device > 2 ? "box-s" : "box-xxl padding-t-s"
                  } a-end j-end gap-s`}
                >
                  <button
                    form="none"
                    className="btn-small btn-active"
                    disabled={loading}
                    onClick={() => {
                      setEditorOpened({ ...editorOpened, rut_editor: false });
                      setError(null);
                    }}
                  >
                    <IoIosCloseCircle className="zoom-out-xxl" />
                  </button>
                  <button
                    form="rut-form"
                    disabled={loading}
                    type="submit"
                    className="btn-small btn-active"
                  >
                    <FaRegSave className="zoom-out-xxl" />
                  </button>
                </div>
              </form>
            )}

            {!phone_editor ? (
              <div className="flex box-xxl padding-s base-border-b">
                <div className="flex box-l column a-start j-center gap-xxs">
                  <h4>Phone number</h4>
                  <h4>{user?.phone ? user.phone : "No asignado"}</h4>
                </div>
                <div className="flex box-s a-end j-end gap-s">
                  <button
                    onClick={() => openEditor("phone")}
                    disabled={loading}
                    className="btn-small btn-active"
                  >
                    <FaEdit className="zoom-out-xxl" />
                  </button>
                </div>
              </div>
            ) : (
              <form
                id="phone-form"
                onSubmit={(e) => onSubmit("phone", e)}
                action="#"
                encType="multipart/form-data"
                className="flex box-xxl wrap padding-s base-border-b"
              >
                <div
                  className={`flex ${
                    device > 2 ? "box-l" : "box-xxl"
                  } column a-start j-center gap-xxs`}
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
                    device > 2 ? "box-s" : "box-xxl padding-t-s"
                  } a-end j-end gap-s`}
                >
                  <button
                    form="none"
                    className="btn-small btn-active"
                    disabled={loading}
                    onClick={() => {
                      setEditorOpened({
                        ...editorOpened,
                        phone_editor: false,
                      });
                      setError(null);
                    }}
                  >
                    <IoIosCloseCircle className="zoom-out-xxl" />
                  </button>
                  <button
                    form="phone-form"
                    disabled={loading}
                    type="submit"
                    className="btn-small btn-active"
                  >
                    <FaRegSave className="zoom-out-xxl" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
