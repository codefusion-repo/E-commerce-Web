"use client";
// usePostComment.tsx

// import "./userPostComment.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../../context/auth/authContext";
import { useModal } from "../../../../../../context/modal/modalContext";
import AddPostComment from "./add/postAddComment";
import DeletePostComment from "./delete/delete";
import PostCommentEditor from "./editor/postCommentEditor";
import PostCommentDefault from "./default/postCommentDefault";
import { CommentType } from "../../../../../../interfaces/shop/shopInterface";
import { useMobile } from "../../../../../../context/mobile/mobileContext";

export default function UserPostComment({
  comments,
  postId,
}: {
  comments: CommentType[];
  postId: string;
}) {
  const { device } = useMobile();
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
        <div
          className={`flex box-xxl ${
            device > 0 ? "" : "column"
          } a-center j-center gap-s second-bg padding-ms`}
        >
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
            <h4>Log in to your account</h4>
          </button>
          <h4>to send a comment</h4>
        </div>
      )}
      {!isUserComment && isAuthenticated && <AddPostComment postId={postId} />}
      {isUserComment && comment && isAuthenticated && (
        <>
          {!commentStatus && (
            <PostCommentDefault
              comment={comment}
              setCommentStatus={setCommentStatus}
            />
          )}
          {commentStatus === "editor" && (
            <PostCommentEditor
              comment={comment}
              setCommentStatus={setCommentStatus}
            />
          )}
          {commentStatus === "delete" && (
            <DeletePostComment
              comment={comment}
              setCommentStatus={setCommentStatus}
            />
          )}
        </>
      )}
    </div>
  );
}
