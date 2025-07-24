"use client";
import { useMobile } from "../../../context/mobile/mobileContext";
import {
  CategoryType,
  SubategoryType,
} from "../../../interfaces/shop/shopInterface";
// categories.tsx

// import "./categories.css";
import Link from "next/link";

export default function Categories({
  header,
  categories,
}: {
  header: string;
  categories: CategoryType[] | SubategoryType[];
}) {
  const { device } = useMobile();
  return (
    <div className={`flex ${device > 2 ? "box-xl" : "box-xxl-m"}  column`}>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-l-ms padding-r-ms padding-t-xs padding-b-xs second-border-b">
        <h1>{header}</h1>
      </div>
      <div className="flex box-xxl wrap a-center j-center padding-s">
        {categories.map((category, index) => (
          <Link
            href={`/shop/${category.slug}`}
            className={`flex column f-width-m a-center t-center j-space gap-xs padding-xs`}
            key={category.id}
          >
            <img
              className="f-width-s f-height-s border-radius-xs zoom-out-xs"
              src={`${category.icon}`}
              alt={category.name}
            />
            <h3>{category.name} </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
