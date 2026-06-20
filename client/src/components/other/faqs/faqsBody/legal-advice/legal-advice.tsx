"use client";
import Link from "next/link";

export default function LegalAdvice() {
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Aviso legal</h1>
      </div>

      <div className="flex column box-xxl a-start padding-s gap-s">
        <h2>Identidad del proyecto</h2>
        <h4>
          ecommerce-demo.codefusion.cl es una demo de portfolio creada por
          CodeFusion para mostrar una experiencia e-commerce construida con
          frontend, backend, autenticacion, catalogo, carrito, cupones y pago
          Flow.
        </h4>
        <h2>Uso permitido</h2>
        <h4>
          Puedes navegar la demo, revisar sus flujos y usarla como referencia
          tecnica. No representa una tienda real, no procesa ventas reales y no
          debe usarse para ingresar secretos, credenciales sensibles ni datos de
          pago reales.
        </h4>
        <h2>Contenido y marcas</h2>
        <h4>
          Los textos, pantallas y recursos visuales se presentan como material
          demostrativo. Las marcas o proveedores mencionados, incluido Flow,
          aparecen solo para explicar el flujo de integracion disponible en la
          demo.
        </h4>
        <h2>Enlaces</h2>
        <h4>
          La pagina principal de la demo esta disponible en{" "}
          <Link
            href={"https://ecommerce-demo.codefusion.cl/"}
            className="second-color cursor-pointer"
          >
            https://ecommerce-demo.codefusion.cl/
          </Link>
          .
        </h4>
        <h2>Contacto</h2>
        <h4>
          Para consultas sobre el proyecto o el portfolio CodeFusion, escribe a
          hellocodefusion@gmail.com.
        </h4>
      </div>
    </>
  );
}
