// `app/shop/categoria/producto page.tsx` is the UI for the `/shop/categoria/producto` URL

import Product from "../../../../../components/shop/shopBody/product/product";

export default async function Page({
  params: { slugProduct },
}: {
  params: { slugProduct: string };
}) {
  return <Product slugProduct={slugProduct} />;
}
