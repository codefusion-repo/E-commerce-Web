"use client";
import Link from "next/link";

export default function InfoOnline() {
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Información de compra online</h1>
      </div>
      <div className="flex column box-xxl a-start padding-s gap-s">
        <h2>¿Qué muestra esta demo?</h2>
        <h4>
          CodeFusion E-commerce Demo muestra catálogo, búsqueda, carrito,
          cupones, dirección de envío, método de despacho y pago Flow en un
          recorrido de compra realista.
        </h4>
        <h2>¿Qué método de pago está disponible?</h2>
        <h4>
          Flow es el único proveedor visible en checkout. Puedes revisar más
          detalle en{" "}
          <Link
            href={"/faqs/payment-methods"}
            className="second-color cursor-pointer"
          >
            métodos de pago
          </Link>
          .
        </h4>
        <h2>¿Cómo hago una compra de prueba?</h2>
        <h4>
          Revisa la guía{" "}
          <Link href={"/how-buy"} className="second-color cursor-pointer">
            cómo comprar
          </Link>{" "}
          para recorrer catálogo, carrito, cupones y checkout paso a paso.
        </h4>
        <h2>¿Cómo uso un cupón?</h2>
        <h4>
          En checkout puedes seleccionar un cupón disponible o ingresar un
          código manual. El selector se mantiene visible para probar estados de
          cupón aplicado, expirado o no disponible.
        </h4>
        <h2>¿Esta demo vende productos reales?</h2>
        <h4>
          No. Es una demo de portfolio para mostrar capacidades técnicas y de
          producto. No compartas datos sensibles ni uses credenciales reales en
          pruebas.
        </h4>
        <h2>¿Qué pasa si un pago falla?</h2>
        <h4>
          El flujo conserva estados de orden y permite reintentar pago con Flow
          cuando corresponde, sin cambiar proveedores ni alterar la lógica de
          checkout.
        </h4>
      </div>
    </>
  );
}
