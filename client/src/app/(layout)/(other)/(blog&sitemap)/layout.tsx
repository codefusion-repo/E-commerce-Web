// `app/(layout)/(other)/(blog&sitemap)/layout.tsx`

import { BlogProvider } from "../../../../context/blog/blogContext";

// Función para obtener información del blog
async function getBlogData() {
  const blogData = {
    categories: [],
    posts: [],
  };
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL_DOCKER}/api/blog/get/categories`,
      // { cache: "no-store" }
      { next: { revalidate: 1600 } }
    );
    if (res.status === 200) {
      const data = await res.json();
      blogData.categories = data.blogCategories;
    }
  } catch {
    //throw new Error("It was not possible to obtain the necessary information");
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL_DOCKER}/api/blog/get/posts`,
      // { cache: "no-store" }
      { next: { revalidate: 1600 } }
    );
    if (res.status === 200) {
      const data = await res.json();
      blogData.posts = data.posts;
    }
  } catch {
    //throw new Error("It was not possible to obtain the necessary information");
  }

  return blogData;
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const blogData = await getBlogData();
  return <BlogProvider blogData={blogData}>{children}</BlogProvider>;
}
