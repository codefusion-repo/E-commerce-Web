"use client";

// pagination.tsx

//import "./pagination.css";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MdOutlineArrowBack, MdOutlineArrowForward } from "react-icons/md";
import { PurchaseType } from "../../interfaces/auth/authInterface";
import { PostType } from "../../interfaces/blog/blogInterface";
import { CommentType, ProductType } from "../../interfaces/shop/shopInterface";

export default function Pagination({
  currentPage,
  setCurrentPage,
  itemsPerPage,
  data,
}: {
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  itemsPerPage: number;
  data: PurchaseType[] | ProductType[] | CommentType[] | PostType[];
}) {
  const [active, setActive] = useState(1);
  const [count, setCount] = useState(data.length);

  useEffect(() => {
    setActive(1);
    setCurrentPage(1);
    setCount(data.length);
  }, [data, setCurrentPage]);

  const visitShopPage = (page: number) => {
    setCurrentPage(page);
    setActive(page);
  };

  const nextShopPage = () => {
    if (currentPage !== 0) {
      setCurrentPage(currentPage + 1);
      setActive(currentPage + 1);
    }
  };

  const previousShopPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
      setActive(currentPage - 1);
    }
  };
  let shopNumbers = [];
  const getShopNumbers = () => {
    let pageNumber = 1;

    if (count < itemsPerPage) return;

    for (let i = 0; i < count; i += itemsPerPage) {
      const page = pageNumber;
      let content = null;

      if (active === page) {
        content = (
          <button key={i} className="btn-small btn-active">
            <h4>{pageNumber}</h4>
          </button>
        );
      } else {
        content = (
          <button
            onClick={() => {
              visitShopPage(page);
            }}
            key={i}
            className="btn-small"
          >
            <h4>{pageNumber}</h4>
          </button>
        );
      }

      shopNumbers.push(content);
      pageNumber++;
    }
    return shopNumbers;
  };
  return (
    <div className="flex relative f-height-s box-xxl gap-s a-center j-center t-center">
      {count > 1 ? (
        <>
          {currentPage !== 1 ? (
            <button
              onClick={() => {
                previousShopPage();
              }}
              className="btn-small"
            >
              <MdOutlineArrowBack className="zoom-out-xxl" />
            </button>
          ) : (
            <></>
          )}
          {getShopNumbers()}
          {shopNumbers.length === 0 || currentPage === shopNumbers.length ? (
            <></>
          ) : (
            <button
              onClick={() => {
                nextShopPage();
              }}
              className="btn-small"
            >
              <MdOutlineArrowForward className="zoom-out-xxl" />
            </button>
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
