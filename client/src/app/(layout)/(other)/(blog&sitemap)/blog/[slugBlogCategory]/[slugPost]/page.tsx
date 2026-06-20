// `app/blog/[slugBlogCategory] page.tsx` is the UI for the `/blog/[slugBlogCategory]` URL

import Post from "../../../../../../../components/other/blog/blogBody/post/post";

type PageProps = {
  params: Promise<{ slugPost: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slugPost } = await params;

  return <Post slugPost={slugPost} />;
}
