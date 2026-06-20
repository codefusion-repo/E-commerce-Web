"use client";
import Link from "next/link";

export default function InfoOnline() {
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Informacion de compra online</h1>
      </div>
      <div className="flex column box-xxl a-start padding-s gap-s">
        <h2>¿Que muestra esta demo?</h2>
        <h4>
          CodeFusion E-commerce Demo muestra catalogo, busqueda, carrito,
          cupones, direccion de envio, metodo de despacho y pago Flow en un
          recorrido de compra realista.
        </h4>
        <h2>¿Que metodo de pago esta disponible?</h2>
        <h4>
          Flow es el unico proveedor visible en checkout. Puedes revisar mas
          detalle en{" "}
          <Link
            href={"/faqs/payment-methods"}
            className="second-color cursor-pointer"
          >
            metodos de pago
          </Link>
          .
        </h4>
        <h2>¿Como hago una compra de prueba?</h2>
        <h4>
          Revisa la guia{" "}
          <Link href={"/how-buy"} className="second-color cursor-pointer">
            como comprar
          </Link>{" "}
          para recorrer catalogo, carrito, cupones y checkout paso a paso.
        </h4>
        <h2>¿Como uso un cupon?</h2>
        <h4>
          En checkout puedes seleccionar un cupon disponible o ingresar un
          codigo manual. El selector se mantiene visible para probar estados de
          cupon aplicado, expirado o no disponible.
        </h4>
        <h2>¿Esta demo vende productos reales?</h2>
        <h4>
          No. Es una demo de portfolio para mostrar capacidades tecnicas y de
          producto. No compartas datos sensibles ni uses credenciales reales en
          pruebas.
        </h4>
        <h2>¿Que pasa si un pago falla?</h2>
        <h4>
          El flujo conserva estados de orden y permite reintentar pago con Flow
          cuando corresponde, sin cambiar proveedores ni alterar la logica de
          checkout.
        </h4>
      </div>
    </>
  );
}
