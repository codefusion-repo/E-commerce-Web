"use client";
// Error components must be Client Components

import Footer from "../components/navigation/footer/footer";
import Navbar from "../components/navigation/navbar/navbar";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <Navbar />
      <div className="flex box-xxl f-height-xxxxl a-start j-center navbar-p-xxl">
        <div className="flex f-width-xxxl f-height-l column a-center j-center gap-s second-bg border-radius-xs">
          <h1>Something went wrong!</h1>
          <h4>{error.message}</h4>
          <button className="btn-middle btn-active" onClick={() => reset()}>
            Refresh
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
