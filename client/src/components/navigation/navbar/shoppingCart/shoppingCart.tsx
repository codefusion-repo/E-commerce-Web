"use client";
// shoppingCart.tsx

import "./shoppingCart.css";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { TiShoppingCart } from "react-icons/ti";
import {
  FaRegTrashAlt,
  FaCartArrowDown,
  FaMinusCircle,
  FaPlusCircle,
} from "react-icons/fa";
import { useAuth } from "../../../../context/auth/authContext";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import Image from "next/image";
import {
  verifyStockAdd,
  verifyStockInput,
  verifyStockRemove,
} from "../../../../components/shopcart/api/action";
import Link from "next/link";
import { useModal } from "../../../../context/modal/modalContext";
import { useRouter } from "next/navigation";
import { useShopcart } from "../../../../context/shopcart/shopcartContext";
import { ProductType } from "../../../../interfaces/shop/shopInterface";
import { useMobile } from "../../../../context/mobile/mobileContext";

type ShoppingCartProps = {
  initState: boolean;
};

export default function ShoppingCart({ initState }: ShoppingCartProps) {
  const { device } = useMobile();
  const { isAuthenticated } = useAuth();

  const {
    items,
    addItem,
    removeItem,
    removeUnitFromItem,
    updateItemQuantity,
    clearShop,
    total,
  } = useShopcart();

  const { openModal } = useModal();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(initState);

  const shippingCartBoxRef = useRef<HTMLDivElement>(null);
  const shippingCartButtonRef = useRef<HTMLDivElement>(null);

  const handleOpenShoppingCart = () => {
    setIsOpen(!isOpen);
  };

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
        }
        setLoading(false);
      });
    } catch (err) {
      setError("Número inválido");
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
      }
      setLoading(false);
    });
  };

  const detectOutClick = (e: MouseEvent) => {
    // Asegúrate de que el evento es del tipo MouseEvent
    const target = e.target as Node; // Cast e.target a Node para usar el método contains

    if (
      shippingCartBoxRef.current &&
      !shippingCartBoxRef.current.contains(target) &&
      shippingCartButtonRef.current &&
      !shippingCartButtonRef.current.contains(target)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", detectOutClick);
    return () => {
      document.removeEventListener("click", detectOutClick);
    };
  }, []);

  const router = useRouter();

  const handleCheckoutButton = () => {
    if (isAuthenticated) {
      router.push("/checkout/delivery");
    } else {
      openModal("login", "Ingresa a tu cuenta para continuar");
    }
  };

  return (
    <div className="mini-cart flex relative">
      <div className="mini-cart__button-wrap" id="shippingCartButtonRef" ref={shippingCartButtonRef}>
        <div className="mini-cart__count absolute f-top f-right">
          {items && items.length >= 0 && <h4>{items.length}</h4>}
        </div>
        <button
          className={`mini-cart__button btn-small ${isOpen && "btn-active"}`}
          onClick={() => handleOpenShoppingCart()}
          type="button"
          aria-label="Abrir carrito"
        >
          <TiShoppingCart className="zoom-in-xxl" />
        </button>
      </div>

      {isOpen && isOpen && (
        <div
          className={`mini-cart__panel flex ${
            device > 1
              ? "f-width-xxxl"
              : device < 1
              ? "box-xxl-m"
              : "f-width-xxl"
          } column fixed f-top f-right navbar-m-s margin-r-s padding-s second-bg base-border border-radius-xxs`}
          id="shippingCartBoxRef"
          ref={shippingCartBoxRef}
        >
          <div className="mini-cart__header flex box-xxl column a-center gap-xs margin-b-xs">
            <h2>
              {items && items.length > 1
                ? `Tienes ${items && items.length} productos en el carrito`
                : items && items.length === 0
                ? `No hay productos en el carrito`
                : `Tienes ${items && items.length} producto en el carrito`}
            </h2>
            {items && items.length >= 1 && (
              <button
                className="btn-span btn-active gap-m"
                onClick={() => clearShop()}
                type="button"
              >
                <h4>Vaciar</h4>
                <FaRegTrashAlt className="zoom-out-xxl" />
              </button>
            )}
            <h4>Máximo 5 unidades por producto</h4>
          </div>

          {items && items.length > 0 && (
            <>
              <div className="flex box-xxl column">
                <div className="flex box-xxl f-height-xxs a-center j-center base-border-t base-border-b">
                  <div className="flex box-xxl j-center base-border-r">
                    <h4>Producto</h4>
                  </div>
                  {/*<div className="flex box-xxl j-center base-border-r">
                    <h4>Precio c/u</h4>
                  </div>*/}
                  <div className="flex box-xxl j-center base-border-r">
                    <h4>Cantidad</h4>
                  </div>
                  <div className="flex box-xxl j-center">
                    <h4>Quitar</h4>
                  </div>
                </div>

                {items &&
                  items.map((item, index) => (
                    <div
                      className="mini-cart__row flex box-xxl f-height-s a-center j-center base-border-b"
                      key={index}
                    >
                      <Link
                        href={`/shop/${
                          item.categories && item.categories[0].slug
                        }/${item.slug}`}
                        className="flex column box-xxl a-center gap-xxs padding-l-xs padding-r-xs"
                      >
                        <h6>
                          {item.name.length > 15
                            ? `${item.name.slice(0, 15)}...`
                            : item.name}
                        </h6>
                        <Image
                          className="f-width-xxs f-height-xxs zoom-out-xs border-radius-xs"
                          src={`${item.thumbnail}`}
                          alt={item.name}
                          width={48}
                          height={48}
                        />
                        <h3>
                          {Intl.NumberFormat("es-CL", {
                            style: "currency",
                            currency: "CLP",
                          }).format(item.price)}
                        </h3>
                      </Link>
                      {/*<div className="flex box-xxl j-center padding-l-xs padding-r-xs">
                        <h3>
                          {Intl.NumberFormat("es-CL", {
                            style: "currency",
                            currency: "CLP",
                          }).format(item.price)}
                        </h3>
                      </div>*/}
                      <div className="flex box-xxl j-center a-center padding-l-xs padding-r-xs">
                        <div className="flex a-center gap-xs">
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
              </div>

              {loading && (
                <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
                  <Image
                    className="f-height-xxs"
                    src={loadingGif}
                    alt="Cargando..."
                  />
                </div>
              )}
              {error && (
                <div
                  className="mini-cart__alert flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b"
                  role="alert"
                >
                  <h4>{error}</h4>
                </div>
              )}

              <div className="flex box-xxl j-end a-center padding-s">
                <h2>
                  {`Subtotal: ${Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  }).format(total && total)}`}
                </h2>
              </div>

              <div className="flex j-center gap-ms">
                <button
                  onClick={() => handleCheckoutButton()}
                  className="btn-middle btn-active"
                  type="button"
                >
                  <h4>Comprar</h4>
                </button>

                <Link
                  href={"/shopcart"}
                  className="flex gap-m btn-middle btn-active"
                >
                  <h4>Ir al carrito</h4>
                  <FaCartArrowDown className="zoom-out-xxl" />
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
