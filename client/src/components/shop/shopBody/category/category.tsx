"use client";
// category.tsx

import "../../shop.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import { useShop } from "../../../../context/shop/shopContext";
import NewsLetter from "../../../../components/other/newsletter/newsletter";
import Categories from "../../../../components/home/categories/categories";
import Products from "../../../../components/home/products/products";
import Link from "next/link";
import {
  CategoryType,
  ProductType,
} from "../../../../interfaces/shop/shopInterface";

export default function Category({ slugCategory }: { slugCategory: string }) {
  const { allCategories, products } = useShop();

  const [category, setCategory] = useState<CategoryType>();
  const [featuredProducts, setFeaturedProducts] = useState<ProductType[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<ProductType[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setCategory(allCategories.find((c) => c.slug === slugCategory));
    setCategoryProducts(
      products.filter((product) =>
        product.categories.some((category) => category.slug === slugCategory)
      )
    );
    setFeaturedProducts(
      products
        .filter((product) =>
          product.categories.some((category) => category.slug === slugCategory)
        )
        .slice()
        .sort((a, b) => b.views - a.views)
        .slice(0, 2)
    );
  }, [allCategories, products, slugCategory]);

  return (
    <>
      {allCategories.find((c) => c.slug === slugCategory) ? (
        <>
          {category && (
            <>
              <div className="shop-hero flex box-xxl f-height-m relative column a-center j-center four-bg hidden">
                <span className="shop-hero__eyebrow z-index-s">
                  {category.type}
                </span>
                <h1 className="z-index-s">{category?.name}</h1>
                <p className="z-index-s">
                  {categoryProducts.length} products in this collection.
                </p>
                <Image
                  className="shop-hero__image absolute f-top f-left fit-cover blur opacity-xs z-index-xs"
                  src={`${category?.icon}`}
                  alt="banner-alt"
                  width={1600}
                  height={640}
                />
              </div>
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
              <Products
                header="Featured products of the category"
                products={featuredProducts}
                isSearch={false}
              />
              <Products
                header="All featured products in the category"
                products={categoryProducts}
                isSearch={false}
              />
              {category.subcategories.length > 0 && (
                <Categories
                  header={
                    category.type === "special"
                      ? "Related categories"
                      : category.type === "brand"
                      ? "Categories related to this brand"
                      : /*: category.type === "category"
                      ? "Marcas relacionadas con esta categoria"*/
                        "Related categories"
                  }
                  categories={category.subcategories}
                />
              )}
              <NewsLetter />
            </>
          )}
        </>
      ) : (
        <div className="flex box-xxl f-height-xxxl a-start j-center navbar-p-xs">
          <div className="flex f-width-xxxl f-height-l column a-center j-center gap-s second-bg border-radius-xs">
            <h1>Page not found 404</h1>
            <h2>We were unable to complete the request</h2>
            <Link className="btn-middle btn-active" href="/">
              Return to home
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
