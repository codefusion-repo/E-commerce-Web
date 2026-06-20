"use client";
// userComment.tsx

//import "./userComment.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../context/auth/authContext";
import DeleteComment from "./delete/delete";
import AddComment from "./add/addComment";
import CommentEditor from "./editor/commentEditor";
import { useModal } from "../../../../../context/modal/modalContext";
import CommentDefault from "./default/defaultComment";
import { CommentType } from "../../../../../interfaces/shop/shopInterface";

export default function UserComment({
  comments,
  productId,
}: {
  comments: CommentType[];
  productId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { user, isAuthenticated } = useAuth();
  const { openModal } = useModal();

  const [isUserComment, setIsUserComment] = useState<boolean>(false);
  const [comment, setComment] = useState<CommentType | undefined>(undefined);
  const [commentStatus, setCommentStatus] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const getUserComment = (comments: CommentType[]) => {
      let isComment: boolean = false;
      comments.forEach((comment) => {
        if (comment.user.email === user?.email) {
          isComment = true;
          setComment(comment);
        }
      });

      setIsUserComment(isComment);

      if (!isComment) {
        setComment(undefined);
      }
    };

    if ((comments.length > 0 && isAuthenticated) || !commentStatus) {
      getUserComment(comments);
    }
  }, [commentStatus, comments, isAuthenticated, user?.email]);

  return (
    <div className="flex box-xxl m-height-xs border-radius-xs hidden">
      {!isUserComment && !isAuthenticated && (
        <div className="flex box-xxl a-center j-center gap-s second-bg padding-ms">
          <button
            className="btn-span btn-active"
            onClick={() => openModal("register", null)}
          >
            <h4>Register</h4>
          </button>
          <h4>or</h4>
          <button
            className="btn-span btn-active"
            onClick={() => openModal("login", null)}
          >
            <h4>Log in</h4>
          </button>
          <h4>in to your account to submit a comment</h4>
        </div>
      )}
      {!isUserComment && isAuthenticated && (
        <AddComment productId={productId} />
      )}
      {isUserComment && comment && isAuthenticated && (
        <>
          {!commentStatus && (
            <CommentDefault
              comment={comment}
              setCommentStatus={setCommentStatus}
            />
          )}
          {commentStatus === "editor" && (
            <CommentEditor
              comment={comment}
              setCommentStatus={setCommentStatus}
            />
          )}
          {commentStatus === "delete" && (
            <DeleteComment
              comment={comment}
              setCommentStatus={setCommentStatus}
            />
          )}
        </>
      )}
    </div>
  );
}
