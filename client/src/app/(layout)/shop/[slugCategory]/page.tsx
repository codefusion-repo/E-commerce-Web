// `app/shop/category page.tsx` is the UI for the `/shop/category` URL

import Category from "../../../../components/shop/shopBody/category/category";

export default async function Page({
  params: { slugCategory },
}: {
  params: { slugCategory: string };
}) {
  return <Category slugCategory={slugCategory} />;
}
