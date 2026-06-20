"use client";

export default function CookiesPolicy() {
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Politica de cookies</h1>
      </div>
      <div className="flex column box-xxl a-start padding-s gap-s">
        <h2>Uso en la demo</h2>
        <h4>
          Esta demo puede usar cookies tecnicas para mantener sesion,
          preferencias de interfaz y estado del carrito durante la navegacion.
          No almacenes informacion sensible al probarla.
        </h4>
        <h2>Preferencias</h2>
        <h4>
          Desde ajustes puedes activar o desactivar mensajes y cookies no
          esenciales disponibles en la experiencia. Las cookies necesarias para
          autenticar o completar el flujo pueden seguir siendo requeridas.
        </h4>
        <h2>Objetivo</h2>
        <h4>
          La finalidad es demostrar como una tienda online preserva continuidad
          entre catalogo, carrito, checkout y perfil sin convertir esta demo en
          una operacion comercial real.
        </h4>
      </div>
    </>
  );
}
