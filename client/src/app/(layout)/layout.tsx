// `app/(layout)/layout.tsx`

import LayoutClient from "../../components/layout/layout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutClient children={children} />;
}
