// `app/blog/[slugBlogCategory] page.tsx` is the UI for the `/blog/[slugBlogCategory]` URL

import BlogCategory from "../../../../../../components/other/blog/blogBody/blogCategory/blogCategory";

type PageProps = {
  params: Promise<{ slugBlogCategory: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slugBlogCategory } = await params;

  return <BlogCategory slugBlogCategory={slugBlogCategory} />;
}
