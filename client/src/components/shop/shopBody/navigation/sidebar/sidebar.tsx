"use client";
// sidebar.tsx

import "./sidebar.css";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdArrowDropDown } from "react-icons/md";
import { HiMenuAlt2 } from "react-icons/hi";
import { CategoryType } from "../../../../../interfaces/shop/shopInterface";

export default function Sidebar({
  categories,
}: {
  categories: CategoryType[];
}) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState<string | null>(
    null
  );
  const [currentCategorySlug, setCurrentCategorySlug] = useState<string | null>(
    null
  );

  const handleCategoryClick = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  const handleSubcategoryClick = (categoryId: string) => {
    if (expandedSubcategory === categoryId) {
      setExpandedSubcategory(null);
    } else {
      setExpandedSubcategory(categoryId);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <HiMenuAlt2 className="icon" />
        <h4>Menu</h4>
      </div>

      <div className="categories-sidebar">
        {categories &&
          categories.map((category) => (
            <div key={category.id} className="category-sidebar">
              <div
                className={`main-category-sidebar ${
                  currentCategorySlug === category.slug ? "active" : ""
                }`}
              >
                <Link
                  href={`/shop/${category.slug}`}
                  className="icon-category-sidebar btn-middle"
                >
                  <Image
                    src={`${category.icon}`}
                    alt={category.name}
                    width={64}
                    height={64}
                  />
                </Link>
                {isOpen && isOpen && (
                  <div className={`category-body`}>
                    <Link className="btn-text" href={`/shop/${category.slug}`}>
                      {category.name}
                    </Link>
                    {category.subcategories.length > 0 && (
                      <button
                        className="btn-text"
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        <MdArrowDropDown className="icon" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              {expandedCategory === category.id &&
                category.subcategories &&
                category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="category-sidebar">
                    <div
                      className={`subcategory-sidebar ${
                        currentCategorySlug === subcategory.slug ? "active" : ""
                      }`}
                    >
                      <Link
                        href={`/shop/${subcategory.slug}`}
                        className="icon-category-sidebar btn-middle"
                      >
                        <Image
                          src={`${subcategory.icon}`}
                          alt={subcategory.name}
                          width={64}
                          height={64}
                        />
                      </Link>
                      <div className="category-body">
                        <Link
                          className="btn-text"
                          href={`/shop/${subcategory.slug}`}
                        >
                          {subcategory.name}
                        </Link>

                        {/*subcategory.subcategories.length > 0 && (
                          <button
                            className="btn-text"
                            onClick={() =>
                              handleSubcategoryClick(subcategory.id)
                            }
                          >
                            <MdArrowDropDown className="icon" />
                          </button>
                        )*/}
                        {/*<button
                          className="small"
                          onClick={() => handleSubcategoryClick(subcategory.id)}
                        >
                          <MdArrowDropDown className="icon" />
                        </button>*/}
                      </div>
                    </div>
                    {/*expandedSubcategory === subcategory.id &&
                      subcategory.subcategories &&
                      subcategory.subcategories.map((subcategory) => (
                        <div
                          key={subcategory.id}
                          className={`sub-subcategory-sidebar ${
                            currentCategorySlug === subcategory.slug
                              ? "active"
                              : ""
                          }`}
                        >
                          <button
                            onClick={() =>
                              handleNavigateClick(subcategory.slug)
                            }
                            className="icon-category-sidebar btn-middle"
                          >
                            <img
                              src={`${process.env.REACT_APP_API_URL}/${subcategory.icon}`}
                              alt={subcategory.name}
                            />
                          </button>
                          <div className={`category-body `}>
                            <button
                              className="btn-text"
                              onClick={() =>
                                handleNavigateClick(subcategory.slug)
                              }
                            >
                              {subcategory.name}
                            </button>
                          </div>
                        </div>
                      ))*/}
                  </div>
                ))}
            </div>
          ))}
      </div>
    </div>
  );
}
