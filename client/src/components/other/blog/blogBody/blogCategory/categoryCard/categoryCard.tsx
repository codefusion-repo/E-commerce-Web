"use client";
// categoryCard.tsx

import Pagination from "../../../../../../components/pagination/pagination";
import { useMobile } from "../../../../../../context/mobile/mobileContext";
import {
  BlogCategoryType,
  PostType,
} from "../../../../../../interfaces/blog/blogInterface";
//import "./categoryCard.css";
//import { BlogCategoryPostType } from "../../../interfaces";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CategoryCard({
  header,
  category,
  posts,
  isActiveButton,
}: {
  header: string;
  category: BlogCategoryType;
  posts: PostType[];
  isActiveButton: boolean;
}) {
  const { device } = useMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [data, setData] = useState<PostType[]>(posts);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data?.slice(startIndex, endIndex);

  return (
    <div className="flex box-xxl column a-center">
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>{header}</h1>
      </div>
      <div className="flex box-xxl wrap a-start j-center">
        {currentItems &&
          currentItems.map((post) => (
            <div
              key={post.id}
              className={`flex ${
                device > 2
                  ? "box-m f-height-ml"
                  : device < 1
                  ? "box-xxl f-height-l"
                  : "box-xxl f-height-ml"
              } column relative a-center j-center hidden padding-s`}
            >
              {post.thumbnail && (
                <Image
                  className="absolute f-top f-left fit-cover blur opacity-xs z-index-xs padding-s"
                  src={`${post.thumbnail}`}
                  alt={post.title}
                  width={960}
                  height={540}
                />
              )}
              <Link
                href={`/blog/${category.slug}/${post.slug}`}
                className="flex column absolute f-top f-left z-index-s margin-s gap-xs padding-s"
              >
                <h1>{post.title}</h1>
                <h4>{post.description}</h4>
              </Link>

              <Link
                href={`/blog/${category.slug}/${post.slug}`}
                className="absolute f-bottom f-right z-index-s btn-span btn-active padding-s"
              >
                <h4>Read more</h4>
              </Link>
            </div>
          ))}

        {data.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            data={data}
          />
        )}
      </div>
      {isActiveButton && (
        <div className="flex box-xxl j-end margin-xs">
          <Link href={`/blog/${category.slug}`} className="btn-span btn-active">
            <h4>Read more about {category.name}</h4>
          </Link>
        </div>
      )}
    </div>
  );
}
