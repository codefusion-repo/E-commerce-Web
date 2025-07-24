"use client";
// sitemap.tsx

//import "./sitemap.css";
import Link from "next/link";
import { useBlog } from "../../../context/blog/blogContext";
import { useShop } from "../../../context/shop/shopContext";
import { useMobile } from "../../../context/mobile/mobileContext";

export default function Sitemap() {
  const { device } = useMobile();
  const { categories, brands, products } = useShop();
  const { posts } = useBlog();

  return (
    <div
      className={`flex wrap ${
        device > 2 ? "box-xl" : "box-xxl-m"
      } a-center j-center margin-t-l margin-b-l`}
    >
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Site map</h1>
      </div>

      <div className="flex wrap box-xxl a-start j-center padding-s gap-xxl">
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Categories</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            {categories.map((category) => (
              <Link
                href={`/shop/${category.slug}`}
                className="btn-span"
                key={category.id}
              >
                <h4>{category.name}</h4>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Brands</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            {brands.map((category) => (
              <Link
                href={`/shop/${category.slug}`}
                className="btn-span"
                key={category.id}
              >
                <h4>{category.name}</h4>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Products</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            {products.map((product) => (
              <Link
                href={`/shop/${product.categories[0].slug}/${product.slug}`}
                className="btn-span"
                key={product.id}
              >
                <h4>{product.name}</h4>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Pages</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            <Link href={"/"} className="btn-span">
              <h4>Home</h4>
            </Link>
            <Link href={"/shop"} className="btn-span">
              <h4>Store</h4>
            </Link>
            <Link href={"/blog"} className="btn-span">
              <h4>Blog</h4>
            </Link>
            <Link href={"/contact"} className="btn-span">
              <h4>Contact</h4>
            </Link>
          </div>
        </div>
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Posts</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            {posts.map((post) => (
              <Link
                href={`/blog/${post.categories[0].slug}/${post.slug}`}
                className="btn-span"
                key={post.id}
              >
                <h4>{post.title.slice(0, 50)}...</h4>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
