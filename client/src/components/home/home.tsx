"use client";
// home.tsx

import "./home.css";
import { useShop } from "../../context/shop/shopContext";
import NewsLetter from "../other/newsletter/newsletter";
import Categories from "./categories/categories";

import logo from "../../assets/sampleBusinessImage.jpeg";
import { useEffect, useState } from "react";
import Products from "./products/products";
import { CategoryType, ProductType } from "../../interfaces/shop/shopInterface";
import { BannerType } from "../../interfaces/utils/utilsInterface";
import BannerSwiper from "./swiper/swiper";
import Link from "next/link";
import { useViewportReveal } from "../../hooks/useViewportReveal";

export default function Home({ banners }: { banners: BannerType[] }) {
  const { categories, brands, products } = useShop();
  const heroRevealRef = useViewportReveal();
  const proofRevealRef = useViewportReveal();

  const [featuredCategories, setFeaturedCategories] = useState<CategoryType[]>(
    []
  );
  const [featuredBrands, setFeaturedBrands] = useState<CategoryType[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    setFeaturedCategories(
      [...categories].sort((a, b) => b.views - a.views).slice(0, 6)
    );
    setFeaturedBrands([...brands].sort((a, b) => b.views - a.views).slice(0, 6));
    setFeaturedProducts(
      [...products].sort((a, b) => b.views - a.views).slice(0, 4)
    );
  }, [brands, categories, products]);

  return (
    <main className="home-page">
      <section
        ref={heroRevealRef}
        className="home-hero reveal reveal--fade"
        aria-labelledby="home-hero-title"
      >
        <div className="home-hero__content">
          <span className="home-kicker">Demo e-commerce CodeFusion</span>
          <h1 id="home-hero-title">
            Catálogo, carrito y checkout de pagos en una demo lista para probar
          </h1>
          <p>
            Explora productos, agrega al carrito, aplica cupones y completa una
            compra de prueba. La demo muestra una experiencia real de tienda
            online sin depender de datos sensibles.
          </p>
          <div className="home-hero__actions">
            <Link href="/shop" className="btn-middle btn-active home-hero__cta">
              Ver catálogo
            </Link>
            <Link href="/shopcart" className="btn-middle home-hero__cta">
              Probar carrito
            </Link>
          </div>
        </div>

        <div className="home-hero__media">
          <img src={logo.src} alt="Vista previa de la demo e-commerce" />
        </div>
      </section>

      <section
        ref={proofRevealRef}
        className="home-proof-strip reveal reveal--slide-up"
        aria-label="Shopping flow"
      >
        <div className="reveal-delay-1">
          <span>01</span>
          <strong>Catálogo</strong>
          <p>Cards responsivas con precio, categorías y acciones claras.</p>
        </div>
        <div className="reveal-delay-2">
          <span>02</span>
          <strong>Carrito</strong>
          <p>Cantidad, subtotal y estados vacíos visibles en desktop y mobile.</p>
        </div>
        <div className="reveal-delay-3">
          <span>03</span>
          <strong>Checkout</strong>
          <p>Dirección, envío, cupones y pago en un flujo único.</p>
        </div>
      </section>

      <BannerSwiper banners={banners} />

      <Products
        header="Featured Products"
        products={featuredProducts}
        isSearch={false}
      />

      <Categories header="Main categories" categories={featuredCategories} />

      <Categories header="Recommended brands" categories={featuredBrands} />

      <NewsLetter />
    </main>
  );
}
