// `app/(layout)/(other)/layout.tsx`

import Other from "../../../components/other/other";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Other>{children}</Other>;
}
