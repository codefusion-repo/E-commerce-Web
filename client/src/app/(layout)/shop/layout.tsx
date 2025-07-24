// `app/(layout)/shop/layout.tsx`

import Shop from "../../../components/shop/shop";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Shop children={children} />;
}
