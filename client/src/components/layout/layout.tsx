"use client";

import { useMobile } from "../../context/mobile/mobileContext";
import Footer from "../navigation/footer/footer";
import Navbar from "../navigation/navbar/navbar";
import Subnavbar from "../navigation/subnavbar/subnavbar";
import Sidebar from "../navigation/sidebar/sidebar";

// layout.tsx

// import "./other.css";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { device } = useMobile();
  return (
    <>
      <Navbar />
      {device > 1 ? <Subnavbar /> : <Sidebar />}
      <div
        className={`flex box-xxl m-height-xxxxl column a-center j-space ${
          device > 1 ? "navbar-p-m" : "sidebar-p-s navbar-p-xs"
        } `}
      >
        {/*<Sidebar categories={categories} />*/}
        {children}
      </div>
      <Footer />
    </>
  );
}
