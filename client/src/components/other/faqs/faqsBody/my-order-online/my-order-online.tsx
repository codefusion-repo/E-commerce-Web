"use client";
import Link from "next/link";

export default function MyOrderOnline() {
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Preguntas frecuentes de pedidos</h1>
      </div>
      <div className="flex column box-xxl a-start padding-s gap-s">
        <h2>¿Cómo reviso mi pedido?</h2>
        <h4>
          Ingresa al perfil y abre compras. La demo muestra código, total,
          estado de pago, estado de despacho y detalle de productos.
        </h4>
        <h2>¿Puedo modificar un pedido?</h2>
        <h4>
          Antes de pagar puedes volver al carrito para ajustar cantidades,
          quitar productos o aplicar cupones. Después de crear la orden, el
          flujo se concentra en pagar o revisar el estado.
        </h4>
        <h2>¿Cómo hago una compra online?</h2>
        <h4>
          La guía{" "}
          <Link href={"/how-buy"} className="second-color cursor-pointer">
            cómo comprar
          </Link>{" "}
          explica el recorrido desde catálogo hasta pago Flow.
        </h4>
        <h2>¿Hay envíos reales?</h2>
        <h4>
          No. Los estados de despacho existen para demostrar la experiencia de
          seguimiento, pero la demo no coordina entregas reales.
        </h4>
        <h2>¿Cuánto cuesta el envío?</h2>
        <h4>
          El costo se calcula dentro del checkout de prueba según la selección
          disponible en la demo y se muestra antes de pagar.
        </h4>
      </div>
    </>
  );
}
