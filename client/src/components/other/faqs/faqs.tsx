"use client";
// faqs.tsx

// import "./faqs.css";
import { useMobile } from "../../../context/mobile/mobileContext";

export default function Faqs({ children }: { children: React.ReactNode }) {
  const { device } = useMobile();
  return (
    <div
      className={`flex wrap ${
        device > 2 ? "box-xl" : "box-xxl-m"
      } a-center j-center margin-t-l margin-b-l`}
    >
      {children}
    </div>
  );
}
