"use client";
import Order from "../../../assets/how-buy/order.png";
import CouponCode from "../../../assets/how-buy/coupon-code.png";
import ShopcartPage from "../../../assets/how-buy/shopcart-page.png";
import ShopcartEmpty from "../../../assets/how-buy/shopcart-empty.png";
import ShopcartNoEmpty from "../../../assets/how-buy/shopcart-no-empty.png";
import ExampleProduct from "../../../assets/how-buy/exampleProduct.png";
import Image from "next/image";
import { useMobile } from "../../../context/mobile/mobileContext";

export default function HowBuy() {
  const { device } = useMobile();
  return (
    <div
      className={`flex wrap ${
        device > 2 ? "box-xl" : "box-xxl-m"
      } a-center j-center margin-t-l margin-b-l`}
    >
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Como comprar en la demo</h1>
      </div>
      <div className="flex column box-xxl a-start padding-s gap-s">
        <h4>
          Esta guia muestra el recorrido que CodeFusion E-commerce Demo permite
          probar: catalogo, carrito, cupones, direccion, envio y pago con Flow.
        </h4>
        <Image
          className={`${
            device > 0 ? "f-width-xxxl" : "f-width-xxxxl"
          } padding-l-s`}
          src={ShopcartEmpty}
          alt="Carrito vacio de la demo"
        />

        <h2>1. Elige un producto</h2>
        <h4>
          Abre el catalogo, revisa una ficha y agrega un producto de prueba al
          carrito.
        </h4>
        <Image
          className={`${device > 2 ? "f-width-l" : "box-xxl"} padding-l-s`}
          src={ExampleProduct}
          alt="Producto de ejemplo"
        />

        <h2>2. Revisa el carrito</h2>
        <h4>
          El icono del carrito se actualiza y el resumen muestra productos,
          cantidades y subtotal.
        </h4>
        <Image
          className={`${
            device > 0 ? "f-width-xxxl" : "f-width-xxxxl"
          } padding-l-s`}
          src={ShopcartNoEmpty}
          alt="Carrito con producto"
        />

        <h2>3. Ajusta cantidades o vuelve al catalogo</h2>
        <h4>
          Puedes sumar unidades, quitar productos o seguir explorando antes de
          iniciar el checkout.
        </h4>
        <Image
          className={`${device > 2 ? "box-xxl" : "box-xxl"} padding-l-s`}
          src={ShopcartPage}
          alt="Pagina de carrito"
        />

        <h2>4. Ingresa direccion y envio</h2>
        <h4>
          El checkout solicita direccion y metodo de despacho para calcular el
          costo antes del pago.
        </h4>

        <h2>5. Aplica cupones</h2>
        <h4>
          Si tienes un codigo, ingresalo en el panel de cupones. Tambien puedes
          seleccionar cupones disponibles para validar descuentos.
        </h4>
        <Image
          className={`${device > 2 ? "f-width-xxxl" : "box-xxl"} padding-l-m`}
          src={CouponCode}
          alt="Campo de cupon"
        />

        <h2>6. Paga con Flow</h2>
        <h4>
          Flow es el unico proveedor visible en esta demo. Al pagar se crea la
          orden y puedes revisar su estado en el perfil.
        </h4>
        <Image
          className={`${device > 2 ? "f-width-xxxxl" : "box-xxl"}`}
          src={Order}
          alt="Detalle de orden"
        />
      </div>
    </div>
  );
}
