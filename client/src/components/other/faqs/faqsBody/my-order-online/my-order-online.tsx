"use client";
import Link from "next/link";

export default function MyOrderOnline() {
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Preguntas frecuentes de pedidos</h1>
      </div>
      <div className="flex column box-xxl a-start padding-s gap-s">
        <h2>¿Como reviso mi pedido?</h2>
        <h4>
          Ingresa al perfil y abre compras. La demo muestra codigo, total,
          estado de pago, estado de despacho y detalle de productos.
        </h4>
        <h2>¿Puedo modificar un pedido?</h2>
        <h4>
          Antes de pagar puedes volver al carrito para ajustar cantidades,
          quitar productos o aplicar cupones. Despues de crear la orden, el
          flujo se concentra en pagar o revisar el estado.
        </h4>
        <h2>¿Como hago una compra online?</h2>
        <h4>
          La guia{" "}
          <Link href={"/how-buy"} className="second-color cursor-pointer">
            como comprar
          </Link>{" "}
          explica el recorrido desde catalogo hasta pago Flow.
        </h4>
        <h2>¿Hay envios reales?</h2>
        <h4>
          No. Los estados de despacho existen para demostrar la experiencia de
          seguimiento, pero la demo no coordina entregas reales.
        </h4>
        <h2>¿Cuanto cuesta el envio?</h2>
        <h4>
          El costo se calcula dentro del checkout de prueba segun la seleccion
          disponible en la demo y se muestra antes de pagar.
        </h4>
      </div>
    </>
  );
}
