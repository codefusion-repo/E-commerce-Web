// `context/shop/api/action.ts`

import {
  CouponType,
  ProductType,
} from "../../../interfaces/shop/shopInterface";
import {
  doc,
  Firestore,
  updateDoc,
} from "firebase/firestore";

export const updateShopcartInFirestore = (
  items: ProductType[],
  cartId: string,
  coupon: CouponType | undefined,
  db: Firestore
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const cartRef = doc(db, "shoppingCart", cartId);

      await updateDoc(cartRef, {
        items: items,
        coupon: coupon ? coupon : {},
      });

      resolve();
    } catch (err) {}
  });
};
