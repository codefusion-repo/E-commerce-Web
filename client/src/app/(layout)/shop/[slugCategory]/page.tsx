// `app/shop/category page.tsx` is the UI for the `/shop/category` URL

import Category from "../../../../components/shop/shopBody/category/category";

type PageProps = {
  params: Promise<{ slugCategory: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slugCategory } = await params;

  return <Category slugCategory={slugCategory} />;
}
