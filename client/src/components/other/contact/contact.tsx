"use client";
// contact.tsx

//import "./contact.css";
import { ChangeEvent, FormEvent, useState } from "react";
import { postSendMessage } from "./api/action";
import { useMessages } from "../../../context/messages/messagesContext";
import Image from "next/image";
import loadingGif from "../../../assets/cargando/loading2.gif";
import NewsLetter from "../newsletter/newsletter";
import { useMobile } from "../../../context/mobile/mobileContext";

export default function Contact() {
  const { device } = useMobile();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { addMessage } = useMessages();

  const [contactFormData, setContactFormData] = useState({
    email: "",
    name: "",
    message: "",
  });

  const { email, name, message } = contactFormData;

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactFormData({ ...contactFormData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    postSendMessage(email, name, message)
      .then((res) => {
        addMessage(res);

        setContactFormData({
          email: "",
          name: "",
          message: "",
        });

        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  return (
    <>
      <div className="flex column box-xxl m-height-xxl gap-xxl a-center j-center">
        <div
          className={`flex ${
            device > 2 ? "box-l" : "box-xxl-m"
          } wrap second-bg border-radius-xxs padding-ms margin-t-l margin-b-l`}
        >
          <div className="flex box-xxl m-height-xxs second-bg column a-start j-center padding-xs base-border-b">
            <h1>Contacto</h1>
          </div>
          {loading && (
            <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
              <Image
                className="f-height-xxs"
                src={loadingGif}
                alt="Cargando..."
              />
            </div>
          )}
          {error && (
            <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
              <h4>{error}</h4>
            </div>
          )}
          <form
            id="contact-form"
            className="flex box-xxl wrap a-center j-center padding-s"
            action="#"
            encType="multipart/form-data"
            onSubmit={(e) => onSubmit(e)}
          >
            <div
              className={`flex ${
                device > 1 ? "box-m" : "box-xxl"
              } column gap-xxs padding-xs margin-b-xxs`}
            >
              <h4>Correo</h4>
              <input
                className="input-large"
                onChange={(e) => onChange(e)}
                type="email"
                id="email"
                name="email"
                value={email}
                placeholder="Ingresa tu correo"
                readOnly={loading}
                required
              />
            </div>
            <div
              className={`flex ${
                device > 1 ? "box-m" : "box-xxl"
              } column gap-xxs padding-xs margin-b-xxs`}
            >
              <h4>Nombre</h4>
              <input
                className="input-large"
                onChange={(e) => onChange(e)}
                type="text"
                id="name"
                name="name"
                value={name}
                placeholder="Ingresa tu nombre"
                readOnly={loading}
                required
              />
            </div>
            <div className="flex box-xxl column gap-xxs padding-xs margin-b-xxs">
              <h4>Mensaje</h4>
              <textarea
                className="input-large"
                onChange={(e) => onChange(e)}
                id="message"
                name="message"
                value={message}
                placeholder="Escribe tu mensaje"
                readOnly={loading}
                required
              />
            </div>
            <div className="flex box-xxl column a-center padding-xxs margin-t-xxs">
              <button className="btn-middle btn-active" disabled={loading}>
                Enviar
              </button>
            </div>
          </form>
        </div>
      </div>
      <NewsLetter />
    </>
  );
}
