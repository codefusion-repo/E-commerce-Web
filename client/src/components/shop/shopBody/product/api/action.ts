// `components/shop/product/api/action.ts`

import { ProductType } from "../../../../../interfaces/shop/shopInterface";

export const verifyStockInputFromPage = (
  productId: string,
  quantity: number,
  items: ProductType[] | undefined
): Promise<number | string> => {
  return new Promise((resolve, reject) => {
    items?.forEach((item) => {
      if (item.id === productId) {
        if (item.quantity + quantity > 5) {
          return resolve("exceed");
        } else if (item.quantity + quantity > parseInt(item.stock)) {
          return resolve("stock");
        } else if (item.quantity + quantity <= 0) {
          return resolve("limit");
        } else if (!quantity) {
          return resolve("limit");
        }
        return resolve(item.quantity + quantity);
      }
    });

    return resolve(quantity);
  });
};
