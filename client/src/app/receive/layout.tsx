// `app/receive/layout.tsx`

import Receive from "../../components/checkout/receive/receive";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Receive children={children} />;
}
