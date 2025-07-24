// `components/shopcart/api/action.ts`

import { ProductType } from "../../../interfaces/shop/shopInterface";

export const verifyStockInput = (
  productId: string,
  quantity: number,
  items: ProductType[] | undefined
): Promise<string> => {
  return new Promise((resolve, reject) => {
    items?.forEach((item) => {
      if (item.id === productId) {
        if (quantity > 5) {
          return resolve("exceed");
        } else if (quantity > parseInt(item.stock)) {
          return resolve("stock");
        } else if (quantity <= 0) {
          return resolve("limit");
        } else if (!quantity) {
          return resolve("limit");
        }
      }
    });
    return resolve("ok");
  });
};
export const verifyStockAdd = (
  productId: string,
  quantity: number,
  items: ProductType[] | undefined
): Promise<string> => {
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
      }
    });
    return resolve("ok");
  });
};
export const verifyStockRemove = (
  productId: string,
  quantity: number,
  items: ProductType[] | undefined
): Promise<string> => {
  return new Promise((resolve, reject) => {
    items?.forEach((item) => {
      if (item.id === productId) {
        if (item.quantity - quantity > 5) {
          return resolve("exceed");
        } else if (item.quantity - quantity > parseInt(item.stock)) {
          return resolve("stock");
        } else if (item.quantity - quantity <= 0) {
          return resolve("limit");
        } else if (!quantity) {
          return resolve("limit");
        }
      }
    });
    return resolve("ok");
  });
};
