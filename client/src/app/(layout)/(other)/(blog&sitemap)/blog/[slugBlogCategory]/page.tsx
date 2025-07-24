// `app/blog/[slugBlogCategory] page.tsx` is the UI for the `/blog/[slugBlogCategory]` URL

import BlogCategory from "../../../../../../components/other/blog/blogBody/blogCategory/blogCategory";

export default async function Page({
  params: { slugBlogCategory },
}: {
  params: { slugBlogCategory: string };
}) {
  return <BlogCategory slugBlogCategory={slugBlogCategory} />;
}
