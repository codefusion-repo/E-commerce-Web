// `app/blog/[slugBlogCategory] page.tsx` is the UI for the `/blog/[slugBlogCategory]` URL

import Post from "../../../../../../../components/other/blog/blogBody/post/post";

export default async function Page({
  params: { slugPost },
}: {
  params: { slugPost: string };
}) {
  return <Post slugPost={slugPost} />;
}
