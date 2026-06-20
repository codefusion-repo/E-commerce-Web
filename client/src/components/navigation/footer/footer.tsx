"use client";
import { useMobile } from "../../../context/mobile/mobileContext";
// footer.tsx

//import "./footer.css";
import Link from "next/link";
import {
  FaTiktok,
  FaYoutube,
  FaInstagramSquare,
  FaFacebookSquare,
} from "react-icons/fa";

export default function Footer() {
  const { device } = useMobile();
  return (
    <div
      className={`flex box-xxl ${
        device > 1 ? "" : "sidebar-p-s"
      } column second-bg`}
    >
      <div className="flex box-xxl wrap j-center">
        <div className="flex f-width-xl column padding-s">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
            <h1>Info</h1>
          </div>

          <div className="flex box-xxl column gap-xxs padding-xxs">
            <Link href={"/faqs/my-account"} className="btn-span">
              Mi cuenta
            </Link>
            <Link href={"/blog"} className="btn-span">
              Blog
            </Link>
            <Link href={"/sitemap"} className="btn-span">
              Mapa del sitio
            </Link>
          </div>
        </div>
        <div className="flex f-width-xl column padding-s">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
            <h1>Compra</h1>
          </div>

          <div className="flex box-xxl column gap-xxs padding-xxs">
            <Link href={"/how-buy"} className="btn-span">
              Como comprar
            </Link>
            <Link href={"/send-conditions"} className="btn-span">
              Costos y condiciones de envio
            </Link>
            <Link href={"/faqs"} className="btn-span">
              Preguntas frecuentes
            </Link>
            <Link href={"/faqs/payment-methods"} className="btn-span">
              Metodos de pago
            </Link>
          </div>
        </div>
        <div className="flex f-width-xl column padding-s">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
            <h1>Otros</h1>
          </div>

          <div className="flex box-xxl column gap-xxs padding-xxs">
            <Link href={"/faqs/cookies-policy"} className="btn-span">
              Politica de cookies
            </Link>
            <Link href={"/faqs/privacy-policy"} className="btn-span">
              Politica de privacidad
            </Link>
            <Link href={"/faqs/legal-advice"} className="btn-span">
              Aviso legal
            </Link>
          </div>
        </div>
        <div className="flex f-width-xl column padding-s">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
            <h1>Contacto</h1>
          </div>

          <div className="flex box-xxl column gap-xxs padding-xxs">
            <Link href="tel:+569xxxxxxxx" className="btn-span">
              +569 xxxx xxxx
            </Link>
            <Link href={"/contact"} className="btn-span">
              Contacto
            </Link>
          </div>
        </div>
      </div>
      <div className="flex box-xxl wrap a-center j-center gap-m padding-m base-border-t">
        <Link
          target="_blank"
          href={"https://www.instagram.com"}
          className="btn-small"
        >
          <FaInstagramSquare className="zoom-out-xxl" />
        </Link>
        <Link
          target="_blank"
          href={"https://www.facebook.com"}
          className="btn-small"
        >
          <FaFacebookSquare className="zoom-out-xxl" />
        </Link>
        <Link
          target="_blank"
          href={"https://www.tiktok.com"}
          className="btn-small"
        >
          <FaTiktok className="zoom-out-xxl" />
        </Link>
        <Link
          target="_blank"
          href={"https://www.youtube.com"}
          className="btn-small"
        >
          <FaYoutube className="zoom-out-xxl" />
        </Link>
      </div>
      <div className="flex box-xxl a-center j-center gap-m padding-m base-border-t">
        <h4>ecommerce-demo.codefusion.cl desarrollado por CodeFusion</h4>
      </div>
    </div>
  );
}
