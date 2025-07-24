"use client";
// blog.tsx

// import "../../blog.css";
import banner1 from "../../../../../assets/banner1.png";
import Image from "next/image";
/*import {
  BlogCategoryPostType,
  BlogCategoryType,
  PostType,
} from "../../interfaces";*/
import CategoryCard from "./categoryCard/categoryCard";
import { useBlog } from "../../../../../context/blog/blogContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BlogCategoryType } from "../../../../../interfaces/blog/blogInterface";

export default function BlogCategory({
  slugBlogCategory,
}: {
  slugBlogCategory: string;
}) {
  const { categories } = useBlog();
  const [blogCategory, setBlogCategory] = useState<BlogCategoryType>();

  useEffect(() => {
    setBlogCategory(categories.find((c) => c.slug === slugBlogCategory));
  }, []);
  return (
    <>
      {categories.find((c) => c.slug === slugBlogCategory) ? (
        <>
          {blogCategory && (
            <>
              <div className="flex box-xxl m-height-m relative column padding-s a-center j-center four-bg hidden">
                <div className="flex box-xxl column a-center j-center padding-xs">
                  <h1 className="z-index-s">{blogCategory.name}</h1>
                  <h5 className="z-index-s">{blogCategory.description}</h5>
                </div>
                <img
                  className="absolute f-top f-left fit-cover blur opacity-xs z-index-xs"
                  src={`${blogCategory.icon}`}
                  alt="banner-alt"
                />
              </div>
              <div className="flex column box-xxl a-center padding-s">
                <CategoryCard
                  header={`Publicaciones destacadas de ${blogCategory.name}`}
                  category={blogCategory}
                  posts={blogCategory.posts
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 4)}
                  isActiveButton={false}
                />
              </div>
              <div className="flex column box-xxl a-center padding-s">
                <CategoryCard
                  header={`Todas las publicaciones de ${blogCategory.name}`}
                  category={blogCategory}
                  posts={blogCategory.posts}
                  isActiveButton={false}
                />
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex box-xxl f-height-xxxl a-start j-center navbar-p-xs">
          <div className="flex f-width-xxxl f-height-l column a-center j-center gap-s second-bg border-radius-xs">
            <h1>Page not found 404</h1>
            <h2>Request could not be completed</h2>
            <Link className="btn-middle btn-active" href="/blog">
              Return to blog
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
