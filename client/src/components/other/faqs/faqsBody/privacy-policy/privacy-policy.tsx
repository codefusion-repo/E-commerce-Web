"use client";

export default function PrivacyPolicy() {
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Política de privacidad</h1>
      </div>
      <div className="flex column box-xxl a-start padding-s gap-s">
        <h2>Alcance</h2>
        <h4>
          Esta política describe el uso esperado de datos dentro de CodeFusion
          E-commerce Demo. La aplicación existe para mostrar flujos de tienda
          online y no debe utilizarse con información sensible real.
        </h4>
        <h2>Datos usados por la experiencia</h2>
        <h4>
          La demo puede solicitar datos de cuenta, dirección, contacto y carrito
          para probar autenticación, perfil, despacho y checkout. Usa datos de
          prueba cuando recorras estos flujos.
        </h4>
        <h2>Pagos</h2>
        <h4>
          Flow es el único proveedor visible en checkout. La demo no busca
          ampliar proveedores ni almacenar datos de tarjetas en la interfaz.
        </h4>
        <h2>Comunicaciones</h2>
        <h4>
          Los formularios de contacto, newsletter y recuperación de contraseña
          existen para demostrar integraciones habituales de una tienda. Evita
          enviar información privada o confidencial.
        </h4>
        <h2>Contacto</h2>
        <h4>
          Para consultas sobre privacidad o uso de la demo, escribe a
          support@codefusion.cl.
        </h4>
      </div>
    </>
  );
}
