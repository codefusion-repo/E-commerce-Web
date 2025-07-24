"use client";
// home.tsx

//import "./home.css";
import { useShop } from "../../context/shop/shopContext";
import NewsLetter from "../other/newsletter/newsletter";
import Categories from "./categories/categories";

import logo from "../../assets/sampleBusinessImage.jpeg";
import { useEffect, useState } from "react";
import Products from "./products/products";
import { CategoryType, ProductType } from "../../interfaces/shop/shopInterface";
import { BannerType } from "../../interfaces/utils/utilsInterface";
import BannerSwiper from "./swiper/swiper";
import { useMobile } from "../../context/mobile/mobileContext";

export default function Home({ banners }: { banners: BannerType[] }) {
  const { device } = useMobile();
  const { categories, brands, products } = useShop();

  const [featuredCategories, setFeaturedCategories] = useState<CategoryType[]>(
    []
  );
  const [featuredBrands, setFeaturedBrands] = useState<CategoryType[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    setFeaturedCategories(
      categories.sort((a, b) => b.views - a.views).slice(0, 6)
    );
    setFeaturedBrands(brands.sort((a, b) => b.views - a.views).slice(0, 6));
    setFeaturedProducts(products.sort((a, b) => b.views - a.views).slice(0, 4));
  }, []);

  return (
    <>
      <BannerSwiper banners={banners} />

      <div
        className={`flex ${
          device > 2 ? "box-xl" : "box-xxl-m"
        } column margin-t-s`}
      >
        <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
          <h1>
            E-Commerce developed by CodeFusion.cl | www.e-commerce-web.store
          </h1>
        </div>

        <div
          className={`flex ${
            device > 2 ? "" : "column"
          } box-xxl gap-m padding-ml`}
        >
          <div
            className={`flex ${device > 2 ? "box-l" : "box-xxl"} column gap-xs`}
          >
            <h3>E-Commerce developed by CodeFusion.cl</h3>
            <h4>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
              facilisis dui id purus consequat, in iaculis dolor ultricies.
              Phasellus dictum imperdiet orci et congue. Praesent vestibulum ac
              nulla eget euismod. Fusce accumsan, neque eu pellentesque
              pellentesque, lacus arcu ornare neque, vitae elementum dui ante
              nec urna. Vivamus suscipit dolor non leo ultricies dictum. Nullam
              vitae lorem at urna tincidunt lacinia sed eget est. Donec non
              lectus porttitor, dictum metus eget, rutrum lorem. Proin tincidunt
              quis mauris congue laoreet. Sed nec erat accumsan, lacinia massa
              sed, pharetra nisi.
            </h4>
          </div>
          <div
            className={`flex ${
              device > 2 ? "box-s j-end" : "box-xxl j-center"
            } a-center`}
          >
            <img
              className={`${
                device > 2 ? "fit-cover" : "f-width-m f-height-m"
              } border-radius-xl`}
              src={logo.src}
              alt="logo"
            />
          </div>
        </div>
      </div>

      <Products
        header="Featured Products"
        products={featuredProducts}
        isSearch={false}
      />

      <Categories header="Main categories" categories={featuredCategories} />

      <Categories header="Recommended brands" categories={featuredBrands} />

      <NewsLetter />
    </>
  );
}
