"use client";

import Navbar from "../components/navigation/navbar/navbar";
import "../style/new-general-style.css";
import Footer from "../components/navigation/footer/footer";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es-CL">
      <body>
        <Navbar />
        <div className="flex box-xxl f-height-xxxxl a-start j-center navbar-p-xxl">
          <div className="flex f-width-xxxl f-height-l column a-center j-center gap-s second-bg border-radius-xs">
            <h1>Ocurrió un problema</h1>
            <h4>No pudimos completar la solicitud. Intenta nuevamente.</h4>
            <button className="btn-middle btn-active" onClick={() => reset()}>
              Reintentar
            </button>
          </div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
