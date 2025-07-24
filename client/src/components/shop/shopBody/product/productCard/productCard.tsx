"use client";
// productCard.tsx

//import "./productCard.css";
import { MdAddShoppingCart } from "react-icons/md";
import { FaLink } from "react-icons/fa";
import Stars from "../comment/stars";
import Link from "next/link";
import { useShopcart } from "../../../../../context/shopcart/shopcartContext";
import { ProductType } from "../../../../../interfaces/shop/shopInterface";
import { useMobile } from "../../../../../context/mobile/mobileContext";

const ProductCard: React.FC<{ product: ProductType }> = ({ product }) => {
  const { device } = useMobile();
  const { addItem } = useShopcart();

  return (
    <div
      key={product.id}
      className={`${
        device > 1 ? "f-width-xl f-height-xxxl" : "f-width-ml f-height-xxl"
      } column relative hidden four-bg border-radius-xs`}
    >
      <Link
        className="flex box-xxl padding-xs"
        href={`/shop/${product.categories && product.categories[0].slug}/${
          product.slug
        }`}
      >
        <img
          className="border-radius-xs zoom-out-xs"
          src={`${product.thumbnail}`}
          alt={product.name}
        />
      </Link>

      <Link
        className="flex box-xxl a-center j-start padding-l-s padding-r-s padding-t-xs"
        href={`/shop/${product.categories && product.categories[0].slug}/${
          product.slug
        }`}
      >
        <h4>{product.name}</h4>
      </Link>
      <div className="flex box-xxl wrap padding-l-s padding-r-s">
        <div
          className={`flex ${
            device > 1 ? "box-m" : "box-xxl"
          } a-start j-start padding-b-xxs`}
        >
          <h1>
            {Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(product.price)}
          </h1>
        </div>
        <div className={`flex ${device > 1 ? "box-m" : "box-xxl"}`}>
          <Stars
            stars={product.stars}
            comments_quantity={product.comments_quantity}
            inCenter={false}
          />
        </div>
        {device < 2 && (
          <div
            className={`flex column ${
              device > 1 ? "box-m" : "box-xxl"
            } a-end j-center padding-xxs gap-xxs`}
          >
            {product.categories &&
              product.categories.map((category) => (
                <Link key={category.id} href={`/shop/${category.slug}`}>
                  <h5>{category.name}</h5>
                </Link>
              ))}
          </div>
        )}
      </div>

      {device > 1 && (
        <div className="flex column absolute f-bottom f-left gap-xs padding-l-s padding-b-ms">
          {product.categories &&
            product.categories.map((category) => (
              <Link key={category.id} href={`/shop/${category.slug}`}>
                <h5>{category.name}</h5>
              </Link>
            ))}
        </div>
      )}
      <div className="flex absolute f-bottom f-right gap-xl padding-r-m padding-b-m">
        <Link
          className="btn-small btn-active scale-xl"
          href={`/shop/${product.categories && product.categories[0].slug}/${
            product.slug
          }`}
        >
          <FaLink className="zoom-in-xxl" />
        </Link>
        <button
          className="btn-small btn-active scale-xl"
          onClick={() => addItem(product)}
        >
          <MdAddShoppingCart className="zoom-in-xxl" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
