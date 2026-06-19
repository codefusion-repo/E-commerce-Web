// `app/checkout/layout.tsx`

import Checkout from "../../components/checkout/checkout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Checkout>{children}</Checkout>;
}
