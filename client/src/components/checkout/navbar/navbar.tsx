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
            alt="logo"
          />
        </Link>
      </div>
      <div className="checkout-navbar__title flex box-xxl a-center j-center">
        <h2>E-commerce Web</h2>
      </div>
      <div className="checkout-navbar__help flex box-xxl a-center j-end padding-r-m">
        <h3>Need help? Call us at x xxxxxxxx</h3>
      </div>
    </header>
  );
}
