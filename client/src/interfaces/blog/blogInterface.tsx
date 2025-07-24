// blogInterface.tsx

import { CommentType } from "../shop/shopInterface";

// Interface para cada categoría del blog
export interface BlogCategoryType {
  id: string;
  name: string;
  icon: string;
  slug: string;
  description: string;
  posts: PostType[];
  views: number;
}

// Interface para cada publicación del blog
export interface PostType {
  id: string;
  categories: BlogCategoryType[];
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  slug: string;
  stars: string;
  author: string;
  creationDate: Date;
  views: number;
  comments: CommentType[];
}
