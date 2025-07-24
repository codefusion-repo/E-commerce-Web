"use client";
// navbar.tsx

// import "./navbar.css";
import logo from "../../../assets/sampleBusinessImage.jpeg";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutNavbar() {
  return (
    <header className="flex fixed box-xxl f-height-ms f-top f-left second-bg">
      <div className="flex box-xxl a-center j-start padding-l-m">
        <Link href={"/"}>
          <Image
            className="f-width-s f-height-s border-radius-xxs zoom-out-xs"
            src={logo}
            alt="logo"
          />
        </Link>
      </div>
      <div className="flex box-xxl a-center j-center">
        <h2>E-commerce Web</h2>
      </div>
      <div className="flex box-xxl a-center j-end padding-r-m">
        <h3>Need help? Call us at x xxxxxxxx</h3>
      </div>
    </header>
  );
}
