import { ProductType } from "../../../interfaces/shop/shopInterface";

export const orderProducts = (
  orderBy: string | null,
  products: ProductType[]
): Promise<ProductType[]> => {
  return new Promise((resolve, reject) => {
    if (orderBy === null || orderBy === "df") {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (orderBy === "mp") {
      products.sort((a, b) => a.views - b.views);
    }
    if (orderBy === "az") {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (orderBy === "za") {
      products.sort((a, b) => b.name.localeCompare(a.name));
    }
    if (orderBy === "me") {
      products.sort((a, b) => a.price - b.price);
    }
    if (orderBy === "ma") {
      products.sort((a, b) => b.price - a.price);
    }
    if (orderBy === "ra") {
      products.sort(
        (a, b) =>
          new Date(b.creationDate).getTime() -
          new Date(a.creationDate).getTime()
      );
    }
    if (orderBy === "ar") {
      products.sort(
        (a, b) =>
          new Date(a.creationDate).getTime() -
          new Date(b.creationDate).getTime()
      );
    }

    return resolve(products);
  });
};
