"use client";
// searchSidebar.tsx

//import "../../../shop/shopBody/navigation/sidebar/sidebar.css";
import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { CategoryType } from "../../../../interfaces/shop/shopInterface";
import { SearchFormDataType } from "../../../../interfaces/utils/utilsInterface";
import { useMobile } from "../../../../context/mobile/mobileContext";

export default function SearchSidebar({
  categories,
  brands,
  searchFormData,
  setSearchFormData,
}: {
  categories: CategoryType[];
  brands: CategoryType[];
  searchFormData: SearchFormDataType;
  setSearchFormData: Dispatch<SetStateAction<SearchFormDataType>>;
}) {
  const { device } = useMobile();
  return (
    <div
      className={`flex ${
        device > 2
          ? "box-xs f-height-full second-border-r"
          : `box-xxl ${
              brands.length !== 0 && categories.length !== 0 && "f-height-ml"
            } second-border-b`
      } auto column`} /*"flex column fixed f-width-l f-height-xxxxl navbar-m-m f-top f-left f-bottom second-bg z-index-xl base-border-b"*/
    >
      {categories.length > 0 && (
        <div
          className={`flex box-xxl gap-s m-height-xs a-center j-center padding-xs second-border-b`}
        >
          <h2>Categorias</h2>
        </div>
      )}
      {categories.length > 0 && (
        <div
          className={`flex ${
            device > 2 ? "column" : "wrap"
          } box-xxl gap-m padding-t-s padding-b-s second-border-b`}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              className="flex gap-xxs j-start a-center padding-l-xs padding-r-xs cursor-pointer"
              onClick={
                searchFormData.slug === category.slug
                  ? () => setSearchFormData({ ...searchFormData, slug: null })
                  : () =>
                      setSearchFormData({
                        ...searchFormData,
                        slug: category.slug,
                      })
              }
            >
              <Image
                className="f-width-xxs f-height-xxs border-radius-xxs"
                src={`${category.icon}`}
                alt={category.name}
                width={48}
                height={48}
              />
              <h3
                className={`btn-span ${
                  searchFormData.slug === category.slug && "btn-active"
                }`}
              >
                {category.name}
              </h3>
            </button>
          ))}
        </div>
      )}
      {brands.length > 0 && (
        <div
          className={`flex box-xxl gap-s m-height-xs a-center j-center padding-xs second-border-b`}
        >
          <h2>Marcas</h2>
        </div>
      )}
      {brands.length > 0 && (
        <div
          className={`flex ${
            device > 2 ? "column" : "wrap"
          } box-xxl gap-m padding-t-s padding-b-s second-border-b`}
        >
          {brands.map((category) => (
            <button
              key={category.id}
              className="flex gap-xxs j-start a-center padding-l-xs padding-r-xs cursor-pointer"
              onClick={
                searchFormData.slug === category.slug
                  ? () => setSearchFormData({ ...searchFormData, slug: null })
                  : () =>
                      setSearchFormData({
                        ...searchFormData,
                        slug: category.slug,
                      })
              }
            >
              <Image
                className="f-width-xxs f-height-xxs border-radius-xxs"
                src={`${category.icon}`}
                alt={category.name}
                width={48}
                height={48}
              />
              <h3
                className={`btn-span ${
                  searchFormData.slug === category.slug && "btn-active"
                }`}
              >
                {category.name}
              </h3>
            </button>
          ))}
        </div>
      )}
      {brands.length === 0 && categories.length === 0 && (
        <div className="flex box-xxl gap-s m-height-xxs a-center j-center padding-xs">
          <h4>No encontramos categorias ni marcas</h4>
        </div>
      )}
    </div>
  );
}
