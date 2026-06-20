"use client";
// shopBody.tsx
import "../shop.css";
import Image from "next/image";
import banner1 from "../../../assets/banner1.png";
import { useEffect, useState } from "react";
import loadingGif from "../../../assets/cargando/loading2.gif";
import { useShop } from "../../../context/shop/shopContext";
import Categories from "../../../components/home/categories/categories";
import NewsLetter from "../../../components/other/newsletter/newsletter";
import Products from "../../../components/home/products/products";
import { CategoryType } from "../../../interfaces/shop/shopInterface";

export default function ShopBody() {
  const { categories, brands, products } = useShop();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [featuredCategories, setFeaturedCategories] = useState<CategoryType[]>(
    []
  );
  const [featuredBrands, setFeaturedBrands] = useState<CategoryType[]>([]);

  useEffect(() => {
    setFeaturedCategories(
      [...categories].sort((a, b) => b.views - a.views).slice(0, 2)
    );
    setFeaturedBrands([...brands].sort((a, b) => b.views - a.views).slice(0, 2));
  }, [brands, categories]);

  return (
    <>
      <div className="shop-hero flex box-xxl f-height-m relative column a-center j-center four-bg hidden">
        <span className="shop-hero__eyebrow z-index-s">Catálogo</span>
        <h1 className="z-index-s">Tienda demo</h1>
        <p className="z-index-s">
          Explora productos de prueba con acciones claras de carrito.
        </p>
        <Image
          className="shop-hero__image absolute f-top f-left fit-cover blur opacity-xs z-index-xs"
          src={banner1}
          alt="Banner de catálogo"
        />
      </div>

      {loading && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <Image className="f-height-xxs" src={loadingGif} alt="Cargando..." />
        </div>
      )}
      {error && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <h4>{error}</h4>
        </div>
      )}

      <Products header="Todos los productos" products={products} isSearch={false} />

      <Categories header="Categorías principales" categories={featuredCategories} />

      <Categories header="Marcas recomendadas" categories={featuredBrands} />

      <NewsLetter />
    </>
  );
}
