"use client";
// defaultComment.tsx

import Stars from "../../../../../../components/shop/shopBody/product/comment/stars";
import { useMobile } from "../../../../../../context/mobile/mobileContext";
import { CommentType } from "../../../../../../interfaces/shop/shopInterface";
import { Dispatch, SetStateAction } from "react";
import { FaRegTrashAlt, FaEdit } from "react-icons/fa";

export default function CommentDefault({
  comment,
  setCommentStatus,
}: {
  comment: CommentType;
  setCommentStatus: Dispatch<SetStateAction<string | undefined>>;
}) {
  const { device } = useMobile();
  return (
    <div className="flex box-xxl wrap second-bg padding-ms">
      <div className="flex box-xxl a-center j-center gap-s base-border-b padding-b-xs">
        <h4>Tu comentario</h4>
      </div>
      <div className="flex box-xxl wrap a-center j-space">
        <div
          className={`flex ${
            device > 1 ? "box-ml" : "box-xxl"
          } column a-start j-center gap-xs padding-ms`}
        >
          <h4>Usuario: {comment.user.first_name}</h4>
          <h4>Comentario: {comment.comment}</h4>
        </div>

        <div
          className={`flex ${
            device > 1 ? "box-xs" : "box-xxl"
          } column gap-xs a-center j-center padding-ms`}
        >
          <h4>Valoracion:</h4>
          <Stars
            stars={parseFloat(comment.stars)}
            comments_quantity={-1}
            inCenter={true}
          />
        </div>
        <div
          className={`flex ${
            device > 1 ? "box-xs" : "box-xxl"
          } a-center j-end gap-s padding-ms`}
        >
          <button
            className="btn-small btn-active"
            onClick={() => setCommentStatus("editor")}
          >
            <FaEdit className="zoom-out-xxl" />
          </button>
          <button
            className="btn-small btn-active"
            onClick={() => setCommentStatus("delete")}
          >
            <FaRegTrashAlt className="zoom-out-xxl" />
          </button>
        </div>
      </div>
    </div>
  );
}
