"use client";
import { useMobile } from "../../../context/mobile/mobileContext";
import {
  CategoryType,
  SubategoryType,
} from "../../../interfaces/shop/shopInterface";
// categories.tsx

import "./categories.css";
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
    <section
      className={`categories-section flex ${
        device > 2 ? "box-xl" : "box-xxl-m"
      } column`}
    >
      <div className="categories-section__header flex box-xxl m-height-xxs column a-start j-center padding-l-ms padding-r-ms padding-t-xs padding-b-xs">
        <h1>{header}</h1>
      </div>
      <div className="categories-grid flex box-xxl wrap a-center j-center padding-s">
        {categories.map((category) => (
          <Link
            href={`/shop/${category.slug}`}
            className="category-card flex column f-width-m a-center t-center j-space gap-xs padding-xs"
            key={category.id}
          >
            <img
              className="category-card__image f-width-s f-height-s border-radius-xs"
              src={`${category.icon}`}
              alt={category.name}
            />
            <span className="category-card__label">{category.type}</span>
            <h3>{category.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
