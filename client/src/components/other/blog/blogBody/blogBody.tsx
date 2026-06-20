"use client";
// blogBody.tsx

//import "../blog.css";
import banner1 from "../../../../assets/sampleBannerImage.jpeg";
import Image from "next/image";
// import { FeaturedBlogCategoryType } from "../interfaces";
import CategoryCard from "./blogCategory/categoryCard/categoryCard";
import { useBlog } from "../../../../context/blog/blogContext";

export default function BlogBody() {
  const { categories } = useBlog();
  return (
    <>
      <div className="flex box-xxl f-height-m relative column a-center j-center four-bg hidden">
        <div className="flex box-xxl a-center j-center padding-xs">
          <h1 className="z-index-s ">Welcome to E-commerce-Blog!</h1>
        </div>
        <Image
          className="absolute f-top f-left fit-cover blur opacity-xs z-index-xs"
          src={banner1}
          alt="Banner del blog"
        />
      </div>

      {categories.map((category) => (
        <div className="flex box-xxl column a-center" key={category.id}>
          <div className="flex column box-xxl a-center padding-s">
            <CategoryCard
              header={`Publicaciones destacadas de ${category.name}`}
              category={category}
              posts={category.posts
                .sort((a, b) => b.views - a.views)
                .slice(0, 4)}
              isActiveButton={true}
            />
          </div>
          <div className="flex box-xxl f-height-m relative column a-center j-center four-bg hidden">
            <div className="flex box-xxl a-center j-center padding-xs">
              <h1 className="z-index-s">PLACEHOLDER BANNER</h1>
            </div>
            <Image
              className="absolute f-top f-left fit-cover blur opacity-xs z-index-xs"
              src={banner1}
              alt="Banner del blog"
            />
          </div>
        </div>
      ))}
    </>
  );
}
