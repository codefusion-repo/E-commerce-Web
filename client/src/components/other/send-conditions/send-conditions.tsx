"use client";
import { useMobile } from "../../../context/mobile/mobileContext";
import Link from "next/link";

export default function SendConditions() {
  const { device } = useMobile();
  return (
    <div
      className={`flex wrap ${
        device > 2 ? "box-xl" : "box-xxl-m"
      } a-center j-center margin-t-l margin-b-l`}
    >
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Condiciones de envio de la demo</h1>
      </div>

      <div className="flex column box-xxl a-start padding-s gap-s">
        <h2>Despacho simulado</h2>
        <h4>
          CodeFusion E-commerce Demo muestra seleccion de direccion, metodo de
          despacho, costo de envio y seguimiento de pedido para demostrar un
          flujo de compra completo. No coordina envios reales.
        </h4>
        <h2>Costos</h2>
        <h4>
          El costo de envio se calcula dentro del checkout de prueba y se suma
          al subtotal antes del pago Flow. Tambien puede interactuar con cupones
          de envio gratis.
        </h4>
        <h2>Estados de entrega</h2>
        <h4>
          Los estados de preparacion, courier, transito y entrega son parte de
          la narrativa de la demo para revisar como se veria un pedido despues
          del pago.
        </h4>
        <h2>Contacto</h2>
        <h4>
          Para preguntas sobre la implementacion, usa el{" "}
          <Link href={"/contact"} className="second-color cursor-pointer">
            formulario de contacto
          </Link>{" "}
          o escribe a hellocodefusion@gmail.com.
        </h4>
      </div>
    </div>
  );
}
