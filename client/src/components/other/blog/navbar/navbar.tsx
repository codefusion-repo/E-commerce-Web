"use client";
// navbar.tsx

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBlog } from "../../../../context/blog/blogContext";
import { useMobile } from "../../../../context/mobile/mobileContext";

export default function BlogNavbar({}: // blog_categories,
{
  //blog_categories: SimpleBlogCategoryType[];
}) {
  const { device } = useMobile();
  const { categories } = useBlog();

  const params = useParams();
  const slugBlogCategory = params.slugBlogCategory;

  return (
    <div className="flex box-xxl wrap m-height-xs a-center j-center second-bg base-border-t padding-t-xxs padding-b-xxs">
      <div
        className={`flex  ${
          device > 2 ? "f-width-l" : "f-width-ml"
        } a-center j-center padding-xxs`}
      >
        <Link
          href={`/blog`}
          className={`btn-span box-xxl ${!slugBlogCategory && "btn-active"}`}
        >
          <h4>Inicio</h4>
        </Link>
      </div>
      {categories.map((category) => (
        <div
          key={category.id}
          className={`flex ${
            device > 2 ? "f-width-l" : "f-width-ml"
          } a-center j-center padding-xs`}
        >
          <Link
            href={`/blog/${category.slug}`}
            className={`btn-span box-xxl ${
              slugBlogCategory === category.slug && "btn-active"
            }`}
          >
            <h4>{category.name}</h4>
          </Link>
        </div>
      ))}
    </div>
  );
}
