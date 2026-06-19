"use client";
// productCard.tsx

import "./productCard.css";
import { MdAddShoppingCart } from "react-icons/md";
import { FaLink } from "react-icons/fa";
import Stars from "../comment/stars";
import Link from "next/link";
import { useShopcart } from "../../../../../context/shopcart/shopcartContext";
import { ProductType } from "../../../../../interfaces/shop/shopInterface";
import { useMobile } from "../../../../../context/mobile/mobileContext";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import fallbackProductImage from "../../../../../assets/how-buy/exampleProduct.png";
import { useViewportReveal } from "../../../../../hooks/useViewportReveal";

const ProductCard: React.FC<{ product: ProductType; revealOrder?: number }> = ({
  product,
  revealOrder = 0,
}) => {
  const { device } = useMobile();
  const revealRef = useViewportReveal({ revealOnMobile: true });
  const { addItem } = useShopcart();
  const [isAdded, setIsAdded] = useState(false);
  const revealStyle = {
    "--reveal-order": revealOrder % 6,
  } as CSSProperties;

  const primaryCategory = product.categories && product.categories[0];
  const productHref = primaryCategory
    ? `/shop/${primaryCategory.slug}/${product.slug}`
    : "/shop";
  const badgeText = product.status === "on_sale" ? "En oferta" : "";

  useEffect(() => {
    if (!isAdded) {
      return;
    }

    const timeout = window.setTimeout(() => setIsAdded(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [isAdded]);

  const handleAddItem = () => {
    addItem(product);
    setIsAdded(true);
  };

  return (
    <article
      ref={revealRef}
      key={product.id}
      className={`product-card reveal reveal--slide-up ${
        device > 1
          ? "f-width-xl f-height-xxxl"
          : "product-card--compact f-width-xl f-height-xxxl"
      } column relative hidden ${isAdded ? "product-card--added" : ""}`}
      style={revealStyle}
    >
      <Link
        className="product-card__image-link flex box-xxl padding-xs"
        href={productHref}
        aria-label={`View ${product.name}`}
      >
        {badgeText && <span className="product-card__badge">{badgeText}</span>}
        <img
          className="product-card__image border-radius-xs"
          src={`${product.thumbnail}`}
          alt={product.name}
          loading="eager"
          onError={(event) => {
            event.currentTarget.src = fallbackProductImage.src;
          }}
        />
      </Link>

      <Link
        className="product-card__title flex box-xxl a-center j-start padding-l-s padding-r-s padding-t-xs"
        href={productHref}
      >
        <h4>{product.name}</h4>
      </Link>
      <div className="product-card__meta flex box-xxl wrap padding-l-s padding-r-s">
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
        {device < 2 && primaryCategory && (
          <div className="product-card__mobile-categories flex box-xxl a-start j-start padding-xxs gap-xxs">
            <Link href={`/shop/${primaryCategory.slug}`}>
              <h5>{primaryCategory.name}</h5>
            </Link>
          </div>
        )}
      </div>

      {device > 1 && (
        <div className="product-card__categories flex column absolute f-bottom f-left gap-xs padding-l-s padding-b-ms">
          {product.categories &&
            product.categories.map((category) => (
              <Link key={category.id} href={`/shop/${category.slug}`}>
                <h5>{category.name}</h5>
              </Link>
            ))}
        </div>
      )}
      {isAdded && (
        <div className="product-card__toast" role="status">
          Added to cart
        </div>
      )}
      <div
        className={`product-card__actions flex gap-s ${
          device > 1 ? "absolute f-bottom f-right padding-r-s padding-b-s" : ""
        }`}
      >
        <Link
          className="btn-small btn-active product-card__button"
          href={productHref}
          aria-label={`Open ${product.name}`}
        >
          <FaLink />
        </Link>
        <button
          type="button"
          className="btn-small btn-active product-card__button"
          onClick={handleAddItem}
          aria-label={`Add ${product.name} to cart`}
        >
          <MdAddShoppingCart />
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
