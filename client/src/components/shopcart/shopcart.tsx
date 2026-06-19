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
          setError("Maximum reached");
          updateItemQuantity(item, 5);
        } else if (status === "stock") {
          setError("Not available");
          updateItemQuantity(item, 5);
        } else if (status === "limit") {
          setError("Press remove to delete the product");
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
        setError("Maximum reached");
      } else if (status === "stock") {
        setError("Not available");
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
        setError("Press remove to delete the product");
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
      openModal("login", "Log in to your account to continue");
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
          <span>Order summary</span>
          <h2>Shopping cart</h2>
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
                <h4>Product</h4>
              </div>
              <div className="flex box-xxl a-center j-center">
                <h4>Quantity</h4>
              </div>
              <div className="flex box-xxl a-center j-center">
                <h4>Remove</h4>
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
                  <img
                    className="f-width-xs f-height-xs border-radius-xs"
                    src={`${item.thumbnail}`}
                    alt={item.name}
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
                      aria-label={`Remove one ${item.name}`}
                    >
                      <FaMinusCircle className="zoom-out-xl" />
                    </button>
                    <label className="sr-only" htmlFor={`input_${item.id}`}>
                      Quantity for {item.name}
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
                      aria-label={`Add one ${item.name}`}
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
                    aria-label={`Remove ${item.name} from cart`}
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
                alt="Loading..."
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
              <h3>Your cart is empty</h3>
              <p>Browse products in the catalog to begin checkout.</p>
              <Link href="/shop" className="btn-middle btn-active">
                Shop catalog
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
                ? `You have ${items.length} items in your shopping cart`
                : items && items.length === 0
                ? `There are no products in your shopping cart`
                : `You have ${
                    items && items.length
                  } product in your shopping cart`}
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
            <h4>Back to the store</h4>
          </Link>

          {items && items.length >= 1 && (
            <button
              onClick={() => handleCheckoutButton()}
              className="btn-middle btn-active"
              type="button"
            >
              <h4>Place an order</h4>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
