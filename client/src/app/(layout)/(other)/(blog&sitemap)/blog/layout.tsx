// `app/(layout)/(other)/blog/layout.tsx`

import Blog from "../../../../../components/other/blog/blog";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Blog children={children} />;
}
