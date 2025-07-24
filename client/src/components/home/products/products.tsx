"use client";
// products.tsx

import Pagination from "../../../components/pagination/pagination";
import { orderProducts } from "../../../components/shop/api/action";
import FilteredProductCard from "../../../components/shop/shopBody/product/filteredProductCard/filteredProductCard";
import ProductCard from "../../../components/shop/shopBody/product/productCard/productCard";
import { useMobile } from "../../../context/mobile/mobileContext";
import { useShop } from "../../../context/shop/shopContext";
import { ProductType } from "../../../interfaces/shop/shopInterface";
import { useEffect, useState } from "react";

export default function Products({
  header,
  products,

  isSearch,
}: {
  header: string;
  products: ProductType[];

  isSearch: boolean;
}) {
  const { device } = useMobile();
  const { availableOrderBy } = useShop();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [data, setData] = useState<ProductType[]>([]);

  let startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage;
  let currentItems = data?.slice(startIndex, endIndex);

  const [refresh, setRefresh] = useState<boolean>(true);

  useEffect(() => {
    setData(products);
  }, [products]);

  const resetPages = (data: ProductType[]) => {
    startIndex = (currentPage - 1) * itemsPerPage;
    endIndex = startIndex + itemsPerPage;
    currentItems = data?.slice(startIndex, endIndex);
  };

  useEffect(() => {
    if (refresh === true) {
      resetPages(data);
      setRefresh(false);
    }
  }, [refresh, data]);

  useEffect(() => {
    if (isSearch) {
      resetPages(data);
    }
  }, [isSearch, data]);

  return (
    <div
      className={`flex  ${
        isSearch ? `box-xxl` : `${device > 2 ? "box-xl" : "box-xxl-m"}`
      } column a-start j-start`}
    >
      {!isSearch && (
        <div
          className={`flex box-xxl ${
            device > 1 ? "j-space a-center" : "column a-start"
          } m-height-xxs gap-xs padding-l-ms padding-r-ms padding-t-xs padding-b-xs second-border-b`}
        >
          <h1>{header}</h1>
          <select
            className="select-small"
            onChange={(e) =>
              orderProducts(e.target.value, products).then((p) => {
                setData(p);
                setRefresh(true);
              })
            }
            defaultValue="df"
            id="orderBy"
            name="orderBy"
          >
            {availableOrderBy &&
              availableOrderBy.map((orderBy, index) => (
                <option key={index} value={orderBy.type}>
                  {orderBy.name}
                </option>
              ))}
          </select>
        </div>
      )}

      <div className="flex box-xxl wrap a-start j-center padding-xxs">
        {currentItems.length > 0 ? (
          <>
            {currentItems.map((product) => (
              <div key={product.id} className="padding-xs">
                {!isSearch ? (
                  <ProductCard product={product} />
                ) : (
                  <FilteredProductCard product={product} />
                )}
              </div>
            ))}
          </>
        ) : (
          <h4>No products found</h4>
        )}
      </div>
      {data.length > itemsPerPage && (
        <>
          {!refresh ? (
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              data={data}
            />
          ) : (
            <div className="flex f-height-s box-xxl"></div>
          )}
        </>
      )}
    </div>
  );
}
