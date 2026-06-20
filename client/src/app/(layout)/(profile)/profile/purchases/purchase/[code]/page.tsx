// `app/profile/purchases/purchase/[code] page.tsx` is the UI for the `/profile/purchases/purchase/[code]` URL

import Purchase from "../../../../../../../components/profile/purchases/purchase/purchase";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function Page({ params }: PageProps) {
  const { code } = await params;

  return <Purchase code={code} />;
}
