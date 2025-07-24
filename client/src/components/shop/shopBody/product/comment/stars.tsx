"use client";
// stars.tsx

//import "./stars.css";
import { LiaStarSolid } from "react-icons/lia";

export default function Stars({
  stars,
  comments_quantity,
  inCenter,
}: {
  stars: number;
  comments_quantity: number;
  inCenter: boolean;
}) {
  return (
    <div
      className={`flex box-xxl ${
        inCenter ? "a-center j-center" : "a-start j-start"
      } column z-index-s gap-xxs`}
    >
      <div
        className={`flex box-xxl ${
          inCenter ? "a-center j-center" : "a-start j-start"
        } `}
      >
        <LiaStarSolid
          className={`zoom-out-m margin-r-xxs ${
            stars > 0.5 ? "active-star" : "base-color"
          }`}
        />
        <LiaStarSolid
          className={`zoom-out-m margin-r-xxs ${
            stars > 1.5 ? "active-star" : "base-color"
          }`}
        />
        <LiaStarSolid
          className={`zoom-out-m margin-r-xxs ${
            stars > 2.5 ? "active-star" : "base-color"
          }`}
        />
        <LiaStarSolid
          className={`zoom-out-m margin-r-xxs ${
            stars > 3.5 ? "active-star" : "base-color"
          }`}
        />
        <LiaStarSolid
          className={`zoom-out-m margin-r-xxs ${
            stars > 4.5 ? "active-star" : "base-color"
          }`}
        />
      </div>
      {comments_quantity > 0 && comments_quantity != -1 && (
        <h5>{`(${comments_quantity} ${
          comments_quantity <= 1 ? "Comment" : "Comments"
        })`}</h5>
      )}
    </div>
  );
}
