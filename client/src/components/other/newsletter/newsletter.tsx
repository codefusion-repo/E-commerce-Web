"use client";
// newsletter.tsx

// import "./newsletter.css";
import { ChangeEvent, FormEvent, useState } from "react";
import newsletter from "../../../assets/newsletter.jpg";
import Image from "next/image";
import { postNewsletter } from "./api/action";
import { useMessages } from "../../../context/messages/messagesContext";
import { useMobile } from "../../../context/mobile/mobileContext";

export default function NewsLetter() {
  const { device } = useMobile();
  const { addMessage } = useMessages();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    postNewsletter(email)
      .then((res) => {
        // addMessage(res);
        setError(res);
        setEmail("");
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  return (
    <div
      className={`flex ${
        device > 2 ? "box-xl" : "box-xxl"
      } m-height-m relative wrap a-start j-start four-bg hidden`}
    >
      <Image
        className="absolute f-top f-left fit-cover blur opacity-xs z-index-xs"
        src={newsletter}
        alt="Newsletter CodeFusion"
      />
      <div className="flex box-xxl column a-start j-start padding-s base-border-b z-index-s">
        <h1>Recibe novedades de la demo CodeFusion</h1>
      </div>
      {error && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b z-index-s">
          <h4>{error}</h4>
        </div>
      )}
      <form
        id="newsletter-form"
        className="flex box-xxl wrap a-center j-space margin-ms z-index-s"
        action="#"
        encType="multipart/form-data"
        onSubmit={(e) => onSubmit(e)}
      >
        <div
          className={`flex column ${
            device > 1 ? "box-ml" : "box-xxl"
          } gap-xxs padding-xs`}
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
          className={`flex column ${
            device > 1 ? "box-ms" : "box-xxl"
          } gap-xxs a-end j-end padding-xs`}
        >
          <button
            form="newsletter-form"
            className={`btn-middle btn-active`}
            disabled={loading}
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
