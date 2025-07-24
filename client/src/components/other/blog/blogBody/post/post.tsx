"use client";
// post.tsx

// import "./post.css";
//import { PostType } from "../../interfaces";
import DOMPurify from "isomorphic-dompurify";
import UserPostComment from "./comment/userPostComment";
import { useEffect, useState } from "react";
import Pagination from "../../../../../components/pagination/pagination";
import Stars from "../../../../../components/shop/shopBody/product/comment/stars";
import { useBlog } from "../../../../../context/blog/blogContext";
import Link from "next/link";
import { PostType } from "../../../../../interfaces/blog/blogInterface";
import { CommentType } from "../../../../../interfaces/shop/shopInterface";
import { useMobile } from "../../../../../context/mobile/mobileContext";

export default function Post({ slugPost }: { slugPost: string }) {
  const { device } = useMobile();
  const { posts } = useBlog();

  const [post, setPost] = useState<PostType>();

  useEffect(() => {
    setPost(posts.find((p) => p.slug === slugPost));
  }, [posts]);

  const getContent = (post: PostType) => {
    const sanitizedContent = DOMPurify.sanitize(post.content, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src"],
      ADD_URI_SAFE_ATTR: ["src"],
      FORBID_TAGS: ["script"],
    });

    return sanitizedContent;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [data, setData] = useState<CommentType[]>(
    post && post.comments ? post.comments : []
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);

  /*useEffect(() => {
    const comments = post.comments.filter(
      (comment) => comment.user.email !== user?.email
    );
    setData(post.comments);
  }, [post]);*/

  useEffect(() => {
    if (post) {
      setData(post.comments);
    }
  }, [post]);

  return (
    <>
      {posts.find((p) => p.slug === slugPost) ? (
        <>
          {post && (
            <>
              <div className="flex box-xxl m-height-m relative column a-center j-center four-bg hidden padding-xs">
                <div className="flex box-xxl a-center j-center padding-xs">
                  <h1 className="z-index-s">{post.title}</h1>
                </div>
                <Stars
                  stars={parseFloat(post.stars)}
                  comments_quantity={post.comments.length}
                  inCenter={true}
                />
                <img
                  className="absolute f-top f-left fit-cover blur opacity-xs z-index-xs"
                  src={`${post.thumbnail}`}
                  alt={post.title}
                />
              </div>
              <div className="flex column box-xxl a-center padding-s">
                <h3>{post.description}</h3>
              </div>
              <div className="flex column box-xxl a-center padding-s base-color">
                <div dangerouslySetInnerHTML={{ __html: getContent(post) }} />
              </div>
              <div className="flex column box-xxl a-center padding-s">
                <UserPostComment comments={post.comments} postId={post.id} />
                <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
                  <h1>Comments</h1>
                </div>
                {currentItems.length > 0 && (
                  <>
                    <div className="flex column box-xxl">
                      {currentItems &&
                        currentItems.map((comment, index) => (
                          <div
                            className={`flex box-xxl wrap a-center j-space second-border-b`}
                            key={index}
                          >
                            <div
                              className={`flex ${
                                device > 0 ? "box-ml" : "box-xxl"
                              } column a-start j-center gap-xs padding-ms`}
                            >
                              <h4>User: {comment.user.first_name}</h4>
                              <h4>Comment: {comment.comment}</h4>
                            </div>

                            <div
                              className={`flex ${
                                device > 0 ? "box-xs" : "box-xxl"
                              } column gap-xs a-center j-center padding-ms`}
                            >
                              <h4>Rating:</h4>
                              <Stars
                                stars={parseFloat(comment.stars)}
                                comments_quantity={-1}
                                inCenter={true}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                    {data.length > itemsPerPage && (
                      <Pagination
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        data={data}
                      />
                    )}
                  </>
                )}

                {post.comments.length === 0 && (
                  <div className="flex box-xxl gap-m second-border-b padding-ms">
                    <h4>There are no comments on this post yet</h4>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex box-xxl f-height-xxxl a-start j-center navbar-p-xs">
          <div className="flex f-width-xxxl f-height-l column a-center j-center gap-s second-bg border-radius-xs">
            <h1>Page not found 404</h1>
            <h2>Request could not be completed</h2>
            <Link className="btn-middle btn-active" href="/blog">
              Return to blog
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
