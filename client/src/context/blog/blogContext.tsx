"use client";
// blogContext.tsx

import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import {
  BlogCategoryType,
  PostType,
} from "../../interfaces/blog/blogInterface";

// Crear interface para BlogContextType
interface BlogContextType {
  categories: BlogCategoryType[];
  setCategories: Dispatch<SetStateAction<BlogCategoryType[]>>;
  posts: PostType[];
  setPosts: Dispatch<SetStateAction<PostType[]>>;
}

// Crear BlogContext
const BlogContext = createContext<BlogContextType | null>(null);

// Exportar BlogProvider
export const BlogProvider: React.FC<{
  children: ReactNode;
  blogData: {
    categories: BlogCategoryType[];
    posts: PostType[];
  };
}> = ({ children, blogData }) => {
  const [categories, setCategories] = useState<BlogCategoryType[]>(
    blogData.categories
  );
  const [posts, setPosts] = useState<PostType[]>(blogData.posts);
  return (
    <BlogContext.Provider
      value={{
        categories,
        setCategories,
        posts,
        setPosts,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

// Exportar useBlog para usar las variables de BlogContext
export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("useBlog should be used inside a BlogProvider");
  }

  return context;
};
