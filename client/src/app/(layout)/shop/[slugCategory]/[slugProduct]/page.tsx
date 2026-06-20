// `app/shop/categoria/producto page.tsx` is the UI for the `/shop/categoria/producto` URL

import Product from "../../../../../components/shop/shopBody/product/product";

type PageProps = {
  params: Promise<{ slugProduct: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slugProduct } = await params;

  return <Product slugProduct={slugProduct} />;
}
