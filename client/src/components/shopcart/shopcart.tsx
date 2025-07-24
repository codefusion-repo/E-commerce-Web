"use client";
// shopcart.tsx

// import "./shopcart.css";
import { FaRegTrashAlt, FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import { ChangeEvent, useState } from "react";
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

export default function Shopcart() {
  const { device } = useMobile();
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
        className={`flex ${
          device > 2 ? "box-xl" : "box-xxl-m"
        } m-height-m wrap second-bg padding-s margin-t-l margin-b-l border-radius-xxs`}
      >
        <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
          <h2>Shopping cart</h2>
        </div>
        <div
          className={`flex ${
            device > 2 ? "box-l base-border-r" : "box-xxl"
          } column padding-l-xs padding-r-xs`}
        >
          {items && items.length > 0 && (
            <div className="flex box-xxl f-height-xs base-border-b">
              <div className="flex box-xxl a-center j-center">
                <h4>Product</h4>
              </div>
              {/*<div className="flex box-xxl a-center j-center">
                <h4>Precio c/u</h4>
              </div>*/}
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
                className="flex box-xxl m-height-ms a-center j-space base-border-b"
                key={index}
              >
                <Link
                  href={`/shop/${item.categories && item.categories[0].slug}/${
                    item.slug
                  }`}
                  className="flex column box-xxl a-center gap-xxs padding-l-xs padding-r-xs"
                >
                  <h6>
                    {item.name.length > 15
                      ? `${item.name.slice(0, 15)}...`
                      : item.name}
                  </h6>
                  <img
                    className="f-width-xs f-height-xs zoom-out-xs border-radius-xs"
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
                    >
                      <FaMinusCircle className="zoom-out-xl" />
                    </button>
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
                    >
                      <FaPlusCircle className="zoom-out-xl" />
                    </button>
                  </div>
                </div>
                <div className="flex box-xxl j-center padding-l-xs padding-r-xs">
                  <button onClick={() => removeItem(item)} className="btn-span">
                    <FaRegTrashAlt className="zoom-out-xxl" />
                  </button>
                </div>
              </div>
            ))}

          {loading && (
            <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
              <Image
                className="f-height-xxs"
                src={loadingGif}
                alt="Loading..."
              />
            </div>
          )}
          {error && (
            <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
              <h4>{error}</h4>
            </div>
          )}

          <div
            className={`flex ${
              device > 2 ? "j-space" : "column base-border-b"
            } box-xxl a-end padding-xs`}
          >
            <h3>
              {items && items.length > 1
                ? `You have ${
                    items && items.length
                  } items in your shopping cart`
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
          className={`flex box-s ${
            device > 2 ? "box-s column" : "box-xxl j-center"
          } gap-m a-center padding-t-l padding-b-l padding-r-s padding-l-s`}
        >
          <Link href={"/shop"} className="btn-middle">
            <h4>Back to the store</h4>
          </Link>

          {items && items.length >= 1 && (
            <button
              onClick={() => handleCheckoutButton()}
              className="btn-middle btn-active"
            >
              <h4>Place an order</h4>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
