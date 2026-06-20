"use client";

export default function PrivacyPolicy() {
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Politica de privacidad</h1>
      </div>
      <div className="flex column box-xxl a-start padding-s gap-s">
        <h2>Alcance</h2>
        <h4>
          Esta politica describe el uso esperado de datos dentro de CodeFusion
          E-commerce Demo. La aplicacion existe para mostrar flujos de tienda
          online y no debe utilizarse con informacion sensible real.
        </h4>
        <h2>Datos usados por la experiencia</h2>
        <h4>
          La demo puede solicitar datos de cuenta, direccion, contacto y carrito
          para probar autenticacion, perfil, despacho y checkout. Usa datos de
          prueba cuando recorras estos flujos.
        </h4>
        <h2>Pagos</h2>
        <h4>
          Flow es el unico proveedor visible en checkout. La demo no busca
          ampliar proveedores ni almacenar datos de tarjetas en la interfaz.
        </h4>
        <h2>Comunicaciones</h2>
        <h4>
          Los formularios de contacto, newsletter y recuperacion de contraseña
          existen para demostrar integraciones habituales de una tienda. Evita
          enviar informacion privada o confidencial.
        </h4>
        <h2>Contacto</h2>
        <h4>
          Para consultas sobre privacidad o uso de la demo, escribe a
          hellocodefusion@gmail.com.
        </h4>
      </div>
    </>
  );
}
