"use client";
// shopcart.tsx

import "./shopcart.css";
import { FaRegTrashAlt, FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import { ChangeEvent, useEffect, useState } from "react";
import { useAuth } from "../../context/auth/authContext";
import {
  verifyStockAdd,
  verifyStockInput,
  verifyStockRemove,
} from "./api/action";
import loadingGif from "../../assets/cargando/loading2.gif";
import Image from "next/image";
import Link from "next/link";
import { useModal } from "../../context/modal/modalContext";
import { useRouter } from "next/navigation";
import { useShopcart } from "../../context/shopcart/shopcartContext";
import { ProductType } from "../../interfaces/shop/shopInterface";
import { useMobile } from "../../context/mobile/mobileContext";
import { useViewportReveal } from "../../hooks/useViewportReveal";

export default function Shopcart() {
  const { device } = useMobile();
  const shellRevealRef = useViewportReveal();
  const listRevealRef = useViewportReveal();
  const actionsRevealRef = useViewportReveal();
  const {
    items,
    addItem,
    removeItem,
    removeUnitFromItem,
    updateItemQuantity,
    subtotal,
  } = useShopcart();

  const { isAuthenticated } = useAuth();

  const { openModal } = useModal();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastChangedItemId, setLastChangedItemId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!lastChangedItemId) {
      return;
    }

    const timeout = window.setTimeout(() => setLastChangedItemId(null), 800);
    return () => window.clearTimeout(timeout);
  }, [lastChangedItemId]);

  const handleUpdateQuantityItem = (
    item: ProductType,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    try {
      let quantity = parseInt(e.target.value);

      setError(null);
      setLoading(true);

      verifyStockInput(item.id, quantity, items).then((status: string) => {
        if (status === "exceed") {
          setError("Máximo alcanzado");
          updateItemQuantity(item, 5);
        } else if (status === "stock") {
          setError("Stock no disponible");
          updateItemQuantity(item, 5);
        } else if (status === "limit") {
          setError("Usa eliminar para quitar el producto");
        } else if (status === "ok") {
          updateItemQuantity(item, quantity);
          setLastChangedItemId(item.id);
        }
        setLoading(false);
      });
    } catch (err) {
      setError("Invalid number");
      setLoading(false);
      return;
    }
  };
  const handleAddItem = (item: ProductType) => {
    setError(null);
    setLoading(true);

    verifyStockAdd(item.id, 1, items).then((status: string) => {
      if (status === "exceed") {
        setError("Máximo alcanzado");
      } else if (status === "stock") {
        setError("Stock no disponible");
      } else if (status === "ok") {
        addItem(item);
        setLastChangedItemId(item.id);
      }
      setLoading(false);
    });
  };
  const handleRemoveItem = (item: ProductType) => {
    setError(null);
    setLoading(true);

    verifyStockRemove(item.id, 1, items).then((status: string) => {
      if (status === "limit") {
        setError("Usa eliminar para quitar el producto");
      } else if (status === "ok") {
        removeUnitFromItem(item);
        setLastChangedItemId(item.id);
      }
      setLoading(false);
    });
  };

  const router = useRouter();

  const handleCheckoutButton = () => {
    if (isAuthenticated) {
      router.push("/checkout/delivery");
    } else {
      openModal("login", "Ingresa a tu cuenta para continuar");
    }
  };

  return (
    <>
      <div
        ref={shellRevealRef}
        className={`shopcart-shell flex ${
          device > 2 ? "box-xl" : "box-xxl-m"
        } m-height-m wrap padding-s margin-t-l margin-b-l reveal reveal--slide-up`}
      >
        <div className="shopcart-shell__header flex box-xxl m-height-xxs column a-start j-center padding-xs">
          <span>Resumen de compra</span>
          <h2>Carrito</h2>
        </div>
        <div
          ref={listRevealRef}
          className={`shopcart-list flex ${
            device > 2 ? "box-l" : "box-xxl"
          } column padding-l-xs padding-r-xs reveal reveal--fade reveal-delay-1`}
        >
          {items && items.length > 0 && (
            <div className="shopcart-list__columns flex box-xxl f-height-xs">
              <div className="flex box-xxl a-center j-center">
                <h4>Producto</h4>
              </div>
              <div className="flex box-xxl a-center j-center">
                <h4>Cantidad</h4>
              </div>
              <div className="flex box-xxl a-center j-center">
                <h4>Quitar</h4>
              </div>
            </div>
          )}
          {items &&
            items.map((item, index) => (
              <div
                className={`shopcart-row flex box-xxl m-height-ms a-center j-space ${
                  lastChangedItemId === item.id ? "shopcart-row--updated" : ""
                }`}
                key={index}
              >
                <Link
                  href={`/shop/${item.categories && item.categories[0].slug}/${
                    item.slug
                  }`}
                  className="shopcart-row__product flex column box-xxl a-center gap-xxs padding-l-xs padding-r-xs"
                >
                  <h6>
                    {item.name.length > 15
                      ? `${item.name.slice(0, 15)}...`
                      : item.name}
                  </h6>
                  <Image
                    className="f-width-xs f-height-xs border-radius-xs"
                    src={`${item.thumbnail}`}
                    alt={item.name}
                    width={64}
                    height={64}
                  />
                  <h3>
                    {Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    }).format(item.price)}
                  </h3>
                </Link>
                <div className="flex box-xxl j-center a-center padding-l-xs padding-r-xs">
                  <div className="shopcart-quantity flex a-center gap-xs">
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="btn-span"
                      type="button"
                      aria-label={`Quitar una unidad de ${item.name}`}
                    >
                      <FaMinusCircle className="zoom-out-xl" />
                    </button>
                    <label className="sr-only" htmlFor={`input_${item.id}`}>
                      Cantidad para {item.name}
                    </label>
                    <input
                      name="itemQuantity"
                      onChange={(e) => handleUpdateQuantityItem(item, e)}
                      className={`input_${item.id} input-quantity t-center`}
                      type="number"
                      placeholder="0"
                      defaultValue={item.quantity}
                      id={`input_${item.id}`}
                    />
                    <button
                      onClick={() => handleAddItem(item)}
                      className="btn-span"
                      type="button"
                      aria-label={`Agregar una unidad de ${item.name}`}
                    >
                      <FaPlusCircle className="zoom-out-xl" />
                    </button>
                  </div>
                </div>
                <div className="flex box-xxl j-center padding-l-xs padding-r-xs">
                  <button
                    onClick={() => removeItem(item)}
                    className="btn-span"
                    type="button"
                    aria-label={`Quitar ${item.name} del carrito`}
                  >
                    <FaRegTrashAlt className="zoom-out-xxl" />
                  </button>
                </div>
              </div>
            ))}

          {loading && (
            <div className="shopcart-alert shopcart-alert--loading flex box-xxl m-height-xxs column a-center j-center padding-xxs">
              <Image
                className="f-height-xxs"
                src={loadingGif}
                alt="Cargando..."
              />
            </div>
          )}
          {error && (
            <div
              className="shopcart-alert shopcart-alert--error flex box-xxl m-height-xxs column a-center j-center padding-xxs"
              role="alert"
            >
              <h4>{error}</h4>
            </div>
          )}

          {items && items.length === 0 && (
            <div className="shopcart-empty-state">
              <h3>Tu carrito está vacío</h3>
              <p>Explora el catálogo para iniciar una compra de prueba.</p>
              <Link href="/shop" className="btn-middle btn-active">
                Ver catálogo
              </Link>
            </div>
          )}

          <div
            className={`shopcart-list__footer flex ${
              device > 2 ? "j-space" : "column"
            } box-xxl a-end padding-xs`}
          >
            <h3>
              {items && items.length > 1
                ? `Tienes ${items.length} productos en el carrito`
                : items && items.length === 0
                ? `No hay productos en el carrito`
                : `Tienes ${items && items.length} producto en el carrito`}
            </h3>
            {items && items.length > 0 && (
              <h3>
                Subtotal:{" "}
                {Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                }).format(subtotal && subtotal)}
              </h3>
            )}
          </div>
        </div>

        <div
          ref={actionsRevealRef}
          className={`shopcart-actions flex box-s ${
            device > 2 ? "box-s column" : "box-xxl j-center"
          } gap-m a-center padding-t-l padding-b-l padding-r-s padding-l-s reveal reveal--fade reveal-delay-2`}
        >
          <Link href={"/shop"} className="btn-middle">
            <h4>Volver a la tienda</h4>
          </Link>

          {items && items.length >= 1 && (
            <button
              onClick={() => handleCheckoutButton()}
              className="btn-middle btn-active"
              type="button"
            >
              <h4>Iniciar checkout</h4>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
