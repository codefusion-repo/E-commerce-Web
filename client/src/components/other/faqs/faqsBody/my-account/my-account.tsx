"use client";

export default function MyAccount() {
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Preguntas frecuentes de cuenta</h1>
      </div>
      <div className="flex column box-xxl a-start padding-s gap-s">
        <h2>¿Cómo crear una cuenta en ecommerce-demo.codefusion.cl?</h2>
        <h4>
          Abre el menú de usuario, elige registro y completa los datos mínimos
          solicitados. La demo permite validar autenticación, perfil y checkout
          sin exponer información sensible real.
        </h4>
        <h2>¿Cómo recupero mi contraseña?</h2>
        <h4>
          En el formulario de ingreso selecciona recuperar contraseña. Si el
          correo existe en la demo, se enviará un código de verificación para
          definir una nueva clave.
        </h4>
        <h2>¿Puedo cambiar mis datos?</h2>
        <h4>
          Sí. Desde el perfil puedes revisar y editar datos personales, correo,
          contraseña y direcciones guardadas para probar el flujo completo de
          cuenta.
        </h4>
        <h2>¿Dónde veo mis compras?</h2>
        <h4>
          El historial de compras vive en el perfil. Allí puedes revisar órdenes
          creadas, estados de despacho y pagos asociados al flujo Flow de la
          demo.
        </h4>
      </div>
    </>
  );
}
