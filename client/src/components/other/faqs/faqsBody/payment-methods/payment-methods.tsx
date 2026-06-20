"use client";

export default function PaymentMethods() {
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Métodos de pago</h1>
      </div>

      <div className="flex column box-xxl a-start padding-s gap-s">
        <h4>
          En ecommerce-demo.codefusion.cl el checkout expone Flow como único
          proveedor de pago visible para mantener la demo clara y verificable.
        </h4>

        <h2>Pagar con Flow</h2>
        <h4>
          Flow permite simular un pago online con tarjeta dentro de un flujo de
          compra completo: carrito, dirección, despacho, cupones, orden y
          retorno a la tienda.
        </h4>
      </div>
    </>
  );
}
