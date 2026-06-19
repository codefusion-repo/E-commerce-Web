"use client";
import { useMobile } from "../../../context/mobile/mobileContext";
import {
  CategoryType,
  SubategoryType,
} from "../../../interfaces/shop/shopInterface";
// categories.tsx

import "./categories.css";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useViewportReveal } from "../../../hooks/useViewportReveal";

function CategoryRevealCard({
  category,
  index,
}: {
  category: CategoryType | SubategoryType;
  index: number;
}) {
  const revealRef = useViewportReveal();
  const revealStyle = {
    "--reveal-order": index % 6,
  } as CSSProperties;

  return (
    <Link
      ref={revealRef}
      href={`/shop/${category.slug}`}
      className="category-card reveal reveal--slide-up flex column f-width-m a-center t-center j-start gap-xxs padding-xs"
      style={revealStyle}
    >
      <img
        className="category-card__image f-width-s f-height-s border-radius-xs"
        src={`${category.icon}`}
        alt={category.name}
      />
      <h3>{category.name}</h3>
    </Link>
  );
}

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
        {categories.map((category, index) => (
          <CategoryRevealCard
            key={category.id}
            category={category}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
