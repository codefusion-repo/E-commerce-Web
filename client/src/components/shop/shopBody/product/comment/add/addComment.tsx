"use client";
// addComment.tsx

import { LiaStarSolid } from "react-icons/lia";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../../../context/auth/authContext";
import { postComment } from "./api/action";
import Image from "next/image";
import loadingGif from "../../../../../../assets/cargando/loading2.gif";
import { useMobile } from "../../../../../../context/mobile/mobileContext";
import { getProducts } from "../api/action";
import { useShop } from "../../../../../../context/shop/shopContext";

export default function AddComment({ productId }: { productId: string }) {
  const { device } = useMobile();
  const { setProducts } = useShop();
  const { signOutAuthState } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [stars, setStars] = useState<number>(1);
  const [comment, setComment] = useState<string>("");

  const onClickStar = (star: number) => {
    setStars(star);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    setComment(e.target.value);
  };

  const router = useRouter();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    postComment(stars, comment, productId, signOutAuthState)
      .then(() => {
        getProducts().then((updatedProducts) => {
          setProducts(updatedProducts);
          setLoading(false);
        });
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };
  return (
    <form
      id="comment-form"
      onSubmit={(e) => onSubmit(e)}
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
        <h4>Agregar comentario</h4>
      </div>

      <div className="flex box-xxl wrap a-center j-space">
        <div
          className={`flex ${
            device > 1 ? "box-ml" : "box-xxl"
          } column a-start j-center gap-xs padding-ms`}
        >
          <h4>Escribe tu comentario</h4>
          <input
            className="input-large"
            onChange={(e) => onChange(e)}
            type="text"
            id="comment"
            name="comment"
            value={comment}
            placeholder="Escribe tu comentario"
            readOnly={loading}
          />
        </div>
        <div
          className={`flex ${
            device > 1 ? "box-xs" : "box-xxl"
          } column gap-xs a-center j-center padding-ms`}
        >
          <h4>Califica este producto</h4>
          <div className="flex box-xxl j-center reverse">
            <button
              form="none"
              onClick={() => onClickStar(5)}
              className={`star zoom-out-l margin-r-xs cursor-pointer ${
                stars > 4.5 && "active-star"
              }`}
              disabled={loading}
            >
              <LiaStarSolid />
            </button>
            <button
              form="none"
              onClick={() => onClickStar(4)}
              className={`star zoom-out-l margin-r-xs cursor-pointer ${
                stars > 3.5 && "active-star"
              }`}
              disabled={loading}
            >
              <LiaStarSolid />
            </button>
            <button
              form="none"
              onClick={() => onClickStar(3)}
              className={`star zoom-out-l margin-r-xs cursor-pointer ${
                stars > 2.5 && "active-star"
              }`}
              disabled={loading}
            >
              <LiaStarSolid />
            </button>
            <button
              form="none"
              onClick={() => onClickStar(2)}
              className={`star zoom-out-l margin-r-xs cursor-pointer ${
                stars > 1.5 && "active-star"
              }`}
              disabled={loading}
            >
              <LiaStarSolid />
            </button>
            <button
              form="none"
              onClick={() => onClickStar(1)}
              className={`star zoom-out-l margin-r-xs cursor-pointer ${
                stars > 0.5 && "active-star"
              }`}
              disabled={loading}
            >
              <LiaStarSolid />
            </button>
          </div>
        </div>
        <div
          className={`flex ${
            device > 1 ? "box-xs" : "box-xxl"
          } a-center j-end gap-s padding-ms`}
        >
          <button
            form="comment-form"
            className="btn-span btn-active"
            disabled={loading}
          >
            <h4>Enviar</h4>
          </button>
        </div>
      </div>
    </form>
  );
}
