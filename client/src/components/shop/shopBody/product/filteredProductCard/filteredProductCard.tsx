"use client";
// FilteredProductCard.tsx

import "./filteredProductCard.css";
import { MdAddShoppingCart } from "react-icons/md";
import { FaLink } from "react-icons/fa";
import { useShop } from "../../../../../context/shop/shopContext";
import Link from "next/link";
import { useShopcart } from "../../../../../context/shopcart/shopcartContext";
import { ProductType } from "../../../../../interfaces/shop/shopInterface";
import { useMobile } from "../../../../../context/mobile/mobileContext";
import { useEffect, useState } from "react";
import fallbackProductImage from "../../../../../assets/how-buy/exampleProduct.png";

const FilteredProductCard: React.FC<{
  product: ProductType;
}> = ({ product }) => {
  const { device } = useMobile();
  const { setIsOpen } = useShop();
  const { addItem } = useShopcart();
  const [isAdded, setIsAdded] = useState(false);
  const primaryCategory = product.categories && product.categories[0];
  const productHref = primaryCategory
    ? `/shop/${primaryCategory.slug}/${product.slug}`
    : "/shop";

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
      key={product.id}
      className={`filtered-product-card ${
        device > 1
          ? "f-width-l f-height-xxl"
          : "filtered-product-card--compact f-width-xl f-height-xxl"
      } column relative hidden ${isAdded ? "filtered-product-card--added" : ""}`}
    >
      <Link
        className="filtered-product-card__image-link flex box-xxl padding-xs"
        href={productHref}
        onClick={() => setIsOpen(false)}
        aria-label={`View ${product.name}`}
      >
        <img
          className="filtered-product-card__image border-radius-xs"
          src={`${product.thumbnail}`}
          alt={product.name}
          loading="eager"
          onError={(event) => {
            event.currentTarget.src = fallbackProductImage.src;
          }}
        />
      </Link>

      <Link
        className="filtered-product-card__title flex box-xxl a-center j-center padding-l-s padding-r-s margin-t-xs"
        href={productHref}
        onClick={() => setIsOpen(false)}
      >
        <h4>{product.name}</h4>
      </Link>

      {isAdded && (
        <div className="filtered-product-card__toast" role="status">
          Added
        </div>
      )}
      <div className="filtered-product-card__footer flex box-xxl a-center j-center t-center gap-ms padding-ms">
        <div
          className={`flex ${
            device > 1 ? "box-m" : "box-xxl"
          } a-center j-center padding-xxs`}
        >
          <h1>
            {Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(product.price)}
          </h1>
        </div>
        <div
          className={`flex ${
            device > 1 ? "box-m" : "box-xxl"
          } a-center j-center gap-s`}
        >
          <Link
            className="btn-small btn-active filtered-product-card__button"
            href={productHref}
            onClick={() => setIsOpen(false)}
            aria-label={`Open ${product.name}`}
          >
            <FaLink />
          </Link>
          <button
            type="button"
            className="btn-small btn-active filtered-product-card__button"
            onClick={handleAddItem}
            aria-label={`Add ${product.name} to cart`}
          >
            <MdAddShoppingCart />
          </button>
        </div>
      </div>
    </article>
  );
};

export default FilteredProductCard;
