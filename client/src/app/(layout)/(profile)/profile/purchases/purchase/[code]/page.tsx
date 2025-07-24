// `app/profile/purchases/purchase/[code] page.tsx` is the UI for the `/profile/purchases/purchase/[code]` URL

import Purchase from "../../../../../../../components/profile/purchases/purchase/purchase";

export default function Page({
  params: { code },
}: {
  params: { code: string };
}) {
  return <Purchase code={code} />;
}
