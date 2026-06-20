"use client";
// navbar.tsx

import "./navbar.css";
import logo from "../../../assets/sampleBusinessImage.jpeg";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutNavbar() {
  return (
    <header className="checkout-navbar flex fixed box-xxl f-height-ms f-top f-left">
      <div className="checkout-navbar__brand flex box-xxl a-center j-start padding-l-m">
        <Link href={"/"}>
          <Image
            className="f-width-s f-height-s border-radius-xxs"
            src={logo}
            alt="CodeFusion E-commerce Demo"
          />
        </Link>
      </div>
      <div className="checkout-navbar__title flex box-xxl a-center j-center">
        <h2>CodeFusion Demo</h2>
      </div>
      <div className="checkout-navbar__help flex box-xxl a-center j-end padding-r-m">
        <h3>¿Necesitas ayuda? Escríbenos a hellocodefusion@gmail.com</h3>
      </div>
    </header>
  );
}
