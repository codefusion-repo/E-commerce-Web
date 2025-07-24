"use client";
import { useMobile } from "../../../context/mobile/mobileContext";
// receive.tsx

//import "./receive.css";
import CheckoutNavbar from "../navbar/navbar";

export default function Receive({ children }: { children: React.ReactNode }) {
  const { device } = useMobile();
  return (
    <div className="flex box-xxl column a-center j-center navbar-p-s">
      <CheckoutNavbar />
      <div
        className={`flex ${
          device > 3 ? "box-ms" : device < 2 ? "box-xxl-m" : "box-ml"
        }  column a-center j-center second-bg padding-m`}
      >
        <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
          <h2>Receiving payment</h2>
        </div>
        <div className="flex box-xxl column gap-m">{children}</div>
      </div>
    </div>
  );
}
