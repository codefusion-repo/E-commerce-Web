// `app/(layout)/(other)/faqs/layout/.tsx`

import Faqs from "../../../../components/other/faqs/faqs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Faqs>{children}</Faqs>;
}
