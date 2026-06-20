"use client";
// subnavbar.tsx

// import "./subnavbar.css";
import { useShop } from "../../../context/shop/shopContext";
import { MdArrowDropDown } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryType } from "../../../interfaces/shop/shopInterface";

export default function Subnavbar() {
  const { specialCategories } = useShop();

  //const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryType | undefined
  >(undefined);

  const onHoverCategory = (category: CategoryType) => {
    setSelectedCategory(category);
    //setIsOpen(true);
  };
  const onLeaveCategory = () => {
    setSelectedCategory(undefined);
    //setIsOpen(false);
  };

  const subnavbarBoxRef = useRef<HTMLDivElement>(null);
  const subnavbarContent = useRef<HTMLDivElement>(null);

  const detectOutClick = (e: MouseEvent) => {
    // Asegúrate de que el evento es del tipo MouseEvent
    const target = e.target as Node; // Cast e.target a Node para usar el método contains

    if (
      subnavbarBoxRef.current &&
      !subnavbarBoxRef.current.contains(target) &&
      subnavbarContent.current &&
      !subnavbarContent.current.contains(target)
    ) {
      setSelectedCategory(undefined);
    }
  };

  useEffect(() => {
    document.addEventListener("click", detectOutClick);
    return () => {
      document.removeEventListener("click", detectOutClick);
    };
  }, []);

  return (
    <div className="flex box-xxl column fixed f-left f-top f-right z-index-m navbar-m-m">
      <div
        className="flex box-xxl f-height-xs a-center gap-l padding-l-s padding-r-s base-bg second-border-b"
        ref={subnavbarBoxRef}
      >
        {specialCategories.map((category, index) => (
          <Link
            href={`/shop/${category.slug}`}
            onMouseEnter={() => onHoverCategory(category)}
            className={`btn-span ${
              selectedCategory === category && "btn-active"
            }`}
            key={index}
          >
            <h3>{category.name}</h3>
            <MdArrowDropDown className="zoom-out-xxl" />
          </Link>
        ))}
      </div>
      {selectedCategory && (
        <div
          onMouseLeave={() => onLeaveCategory()}
          className="flex box-xxl a-start j-start f-height-ml base-bg second-border-b"
          ref={subnavbarContent}
        >
          <div className="flex box-xs f-height-full a-center j-center t-center second-bg ">
            <h1>{selectedCategory.name.toUpperCase()}</h1>
          </div>
          <div className="flex box-ml wrap padding-s gap-xs">
            {selectedCategory.subcategories.map((category, index) => (
              <Link
                href={`/shop/${category.slug}`}
                className="btn-span"
                key={index}
              >
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
          <div className="flex box-xs f-height-full a-center j-center t-center second-bg ">
            <Image
              className="f-width-l f-height-m border-radius-xxl"
              src={`${selectedCategory.icon}`}
              alt={selectedCategory.name}
              width={320}
              height={240}
            />
          </div>
        </div>
      )}
    </div>
  );
}
