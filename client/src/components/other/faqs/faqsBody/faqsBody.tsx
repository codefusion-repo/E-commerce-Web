"use client";
import { useMobile } from "../../../../context/mobile/mobileContext";
import Link from "next/link";

export default function FaqsBody() {
  const { device } = useMobile();
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Preguntas frecuentes</h1>
      </div>
      <div className="flex wrap box-xxl a-start j-center padding-s gap-xxl">
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Contacto</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            <Link href="mailto:hellocodefusion@gmail.com" className="btn-span">
              hellocodefusion@gmail.com
            </Link>
            <Link href="tel:+569xxxxxxxx" className="btn-span">
              +569 xxxx xxxx
            </Link>
          </div>
        </div>
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Mi cuenta</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            <Link href="/faqs/my-account" className="btn-span">
              Crear cuenta
            </Link>
            <Link href="/faqs/my-account" className="btn-span">
              Recuperar contraseña
            </Link>
            <Link href="/faqs/my-account" className="btn-span">
              Editar datos personales
            </Link>
            <Link href="/faqs/my-account" className="btn-span">
              Historial de compras
            </Link>
          </div>
        </div>
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Compra online</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            <Link href="/faqs/payment-methods" className="btn-span">
              Metodos de pago
            </Link>
            <Link href="/faqs/info-online" className="btn-span">
              Informacion de compra
            </Link>
          </div>
        </div>
        <div className="flex column f-width-xl ">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Pedidos</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            <Link href="/faqs/my-order-online" className="btn-span">
              Seguimiento de pedido
            </Link>
            <Link href="/faqs/my-order-online" className="btn-span">
              Flujo de compra
            </Link>
          </div>
        </div>
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Demo CodeFusion</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            <Link href="/blog" className="btn-span">
              Blog
            </Link>
          </div>
        </div>
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Cambios y devoluciones</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            <Link href="/faqs/returns-exchanges" className="btn-span">
              Politica de demo
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
