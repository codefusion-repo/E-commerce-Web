"use client";
// comment.tsx

import { Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../../../../context/auth/authContext";
import { postDeleteComment } from "./api/action";
import Stars from "../../../../../../../components/shop/shopBody/product/comment/stars";
import Image from "next/image";
import loadingGif from "../../../../../../../assets/cargando/loading2.gif";
import { CommentType } from "../../../../../../../interfaces/shop/shopInterface";
import { useBlog } from "../../../../../../../context/blog/blogContext";
import { getPosts } from "../api/action";
import { useMobile } from "../../../../../../../context/mobile/mobileContext";

export default function DeletePostComment({
  comment,
  setCommentStatus,
}: {
  comment: CommentType;
  setCommentStatus: Dispatch<SetStateAction<string | undefined>>;
}) {
  const { device } = useMobile();
  const { setPosts } = useBlog();
  const { signOutAuthState } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const onClickYes = () => {
    setError(null);
    setLoading(true);

    postDeleteComment(comment.id, signOutAuthState)
      .then(() => {
        getPosts().then((updatedPosts) => {
          setPosts(updatedPosts);
          setLoading(false);
          setCommentStatus(undefined);
        });
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  const onClickNo = () => {
    setCommentStatus(undefined);
  };

  return (
    <form
      id="delete-form"
      className="flex box-xxl wrap second-bg padding-ms"
      action="#"
      encType="multipart/form-data"
    >
      {loading && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <Image className="f-height-xxs" src={loadingGif} alt="Cargando..." />
        </div>
      )}
      {error && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <h4>{error}</h4>
        </div>
      )}

      <div className="flex box-xxl a-center j-center gap-s base-border-b padding-b-xs">
        <h4>¿Quieres eliminar este comentario?</h4>
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
            disabled={loading}
            className="btn-small btn-active"
            onClick={() => onClickNo()}
          >
            No
          </button>
          <button
            disabled={loading}
            className="btn-small btn-active"
            onClick={() => onClickYes()}
          >
            Si
          </button>
        </div>
      </div>
    </form>
  );
}
