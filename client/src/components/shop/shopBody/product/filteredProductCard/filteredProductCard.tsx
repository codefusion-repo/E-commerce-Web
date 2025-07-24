"use client";
// FilteredProductCard.tsx

// import "./filteredProductCard.css";
import { MdAddShoppingCart } from "react-icons/md";
import { FaLink } from "react-icons/fa";
import { useShop } from "../../../../../context/shop/shopContext";
import Link from "next/link";
import { useShopcart } from "../../../../../context/shopcart/shopcartContext";
import { ProductType } from "../../../../../interfaces/shop/shopInterface";
import { useMobile } from "../../../../../context/mobile/mobileContext";

const FilteredProductCard: React.FC<{
  product: ProductType;
}> = ({ product }) => {
  const { device } = useMobile();
  const { setIsOpen } = useShop();
  const { addItem } = useShopcart();
  return (
    <div
      key={product.id}
      className={`${
        device > 1 ? "f-width-l f-height-xxl" : "f-width-ml f-height-xl"
      }  column relative hidden four-bg border-radius-xs`}
    >
      <Link
        className="flex box-xxl padding-xs"
        href={`/shop/${product.categories && product.categories[0].slug}/${
          product.slug
        }`}
        onClick={() => setIsOpen(false)}
      >
        <img
          className="border-radius-xs zoom-out-xs"
          src={`${product.thumbnail}`}
          alt={product.name}
        />
      </Link>

      <Link
        className="flex box-xxl a-center j-center padding-l-s padding-r-s margin-t-xs"
        href={`/shop/${product.categories && product.categories[0].slug}/${
          product.slug
        }`}
        onClick={() => setIsOpen(false)}
      >
        <h4>{product.name}</h4>
      </Link>

      <div className="flex box-xxl absolute f-bottom a-center j-center t-center gap-ms padding-ms">
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
            className="btn-small btn-active scale-s"
            href={`/shop/${product.categories && product.categories[0].slug}/${
              product.slug
            }`}
            onClick={() => setIsOpen(false)}
          >
            <FaLink className="zoom-in-xxl" />
          </Link>
          <button
            className="btn-small btn-active scale-s"
            onClick={() => addItem(product)}
          >
            <MdAddShoppingCart className="zoom-in-xxl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilteredProductCard;
