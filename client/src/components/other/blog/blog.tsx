"use client";
import { useMobile } from "../../../context/mobile/mobileContext";
// blog.tsx

// import "./blog.css";
import BlogNavbar from "./navbar/navbar";

export default function Blog({ children }: { children: React.ReactNode }) {
  const { device } = useMobile();
  return (
    <div
      className={`flex ${device > 2 ? "box-xl" : "box-xxl"} column a-center`}
    >
      <BlogNavbar />
      {children}
    </div>
  );
}
