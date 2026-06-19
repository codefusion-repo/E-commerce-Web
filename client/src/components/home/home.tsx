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

export default function Home({ banners }: { banners: BannerType[] }) {
  const { categories, brands, products } = useShop();

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
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__content">
          <span className="home-kicker">CodeFusion commerce demo</span>
          <h1 id="home-hero-title">
            A polished storefront for fast catalog browsing and guided checkout.
          </h1>
          <p>
            Curated product discovery, cart feedback, eligible coupons and a
            Flow checkout path in one lightweight public demo.
          </p>
          <div className="home-hero__actions">
            <Link href="/shop" className="btn-middle btn-active home-hero__cta">
              Shop catalog
            </Link>
            <Link href="/shopcart" className="btn-middle home-hero__cta">
              View cart
            </Link>
          </div>
          <div className="home-hero__stats" aria-label="Store highlights">
            <div>
              <strong>{products.length}</strong>
              <span>Products</span>
            </div>
            <div>
              <strong>{categories.length}</strong>
              <span>Categories</span>
            </div>
            <div>
              <strong>Flow</strong>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="home-hero__media">
          <img src={logo.src} alt="CodeFusion storefront preview" />
          <div className="home-hero__receipt" aria-label="Checkout summary">
            <span>Checkout path</span>
            <strong>Address, Shipping, Coupons, Flow</strong>
          </div>
        </div>
      </section>

      <section className="home-proof-strip" aria-label="Shopping flow">
        <div>
          <span>01</span>
          <strong>Browse</strong>
          <p>Responsive cards, categories and clear actions.</p>
        </div>
        <div>
          <span>02</span>
          <strong>Build cart</strong>
          <p>Quantity changes surface immediate feedback.</p>
        </div>
        <div>
          <span>03</span>
          <strong>Checkout</strong>
          <p>Address, shipping, coupon and Flow stay connected.</p>
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
