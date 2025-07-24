"use client";
// sidebar.tsx

//import "./sidebar.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MdArrowDropDown } from "react-icons/md";
import { HiMenuAlt2 } from "react-icons/hi";
import { useParams } from "next/navigation";
import { useShop } from "../../../context/shop/shopContext";

export default function Sidebar(/*{
  categories,
}: {
  categories: CategoryType[];
}*/) {
  const { specialCategories } = useShop();
  const [isOpen, setIsOpen] = useState<boolean>(false);

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

  const sidebar = useRef<HTMLDivElement>(null);

  const detectOutClick = (e: MouseEvent) => {
    // Asegúrate de que el evento es del tipo MouseEvent
    const target = e.target as Node; // Cast e.target a Node para usar el método contains

    if (sidebar.current && !sidebar.current.contains(target)) {
      setExpandedCategory(null);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", detectOutClick);
    return () => {
      document.removeEventListener("click", detectOutClick);
    };
  }, []);

  const params = useParams();
  const categorySlug = params.slugCategory;

  return (
    <div
      className={`flex column fixed ${
        isOpen ? "f-width-l" : "f-width-xs"
      } navbar-m-m f-top f-left f-bottom base-bg second-border-r z-index-m`}
      ref={sidebar}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex box-xxl gap-s m-height-xs a-center j-center padding-xs second-border-b cursor-pointer"
      >
        <HiMenuAlt2 className="zoom-out-xxl base-color" />
        {isOpen && <h1 className="zoom-out-s">Menu</h1>}
      </div>

      <div
        className={`flex column box-xxl ${
          isOpen ? "gap-xs" : "gap-ml"
        } margin-t-s`}
      >
        {specialCategories &&
          specialCategories.map((category) => (
            <div key={category.id} className="flex box-xxl column">
              <div className="flex box-xxl padding-l-xs a-center padding-r-xs">
                <Link
                  className={`flex box-xxl gap-xs f-height-xxs ${
                    isOpen ? "j-start" : "j-center"
                  } a-center cursor-pointer`}
                  href={`/shop/${category.slug}`}
                >
                  <img
                    className="zoom-out-s f-width-xxs f-height-xxs border-radius-xxs"
                    src={`${category.icon}`}
                    alt={category.name}
                  />
                  {isOpen && (
                    <h4
                      className={`btn-span ${
                        categorySlug === category.slug && "btn-active"
                      }`}
                    >
                      {category.name}
                    </h4>
                  )}
                </Link>

                {isOpen && (
                  <button
                    className="btn-span"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <MdArrowDropDown className="zoom-out-l base-color" />
                  </button>
                )}
              </div>
              {expandedCategory &&
                expandedCategory === category.id &&
                isOpen && (
                  <div className="flex column box-xxl gap-m margin-t-s margin-b-s">
                    {category.subcategories &&
                      category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          className="flex box-xxl gap-xs f-height-xxs j-start a-center padding-l-m padding-r-m cursor-pointer"
                          href={`/shop/${subcategory.slug}`}
                        >
                          <img
                            className="f-width-xxs f-height-xxs border-radius-xxs"
                            src={`${subcategory.icon}`}
                            alt={subcategory.name}
                          />
                          <h4
                            className={`btn-span ${
                              categorySlug === subcategory.slug && "btn-active"
                            }`}
                          >
                            {subcategory.name}
                          </h4>
                        </Link>
                      ))}
                  </div>
                )}
            </div>
          ))}
      </div>
    </div>
  );
}
