// `context/shop/api/action.ts`

import {
  CouponType,
  ProductType,
} from "../../../interfaces/shop/shopInterface";
import {
  //addDoc,
  //collection,
  doc,
  Firestore,
  //getDoc,
  updateDoc,
} from "firebase/firestore";
// import Cookies from "js-cookie";

/*export const getShopcart = (ipAddress: string, db: Firestore): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const cartId = Cookies.get("shopcartId");
    if (cartId) {
      const cartRef = doc(db, "shoppingCart", cartId);
      const cartSnapshot = await getDoc(cartRef);
      if (cartSnapshot.exists()) {
        const cartData = cartSnapshot.data();
        console.log("Datos del carro:", cartData);
        const payload = {
          cartId: cartId,
          items: cartData.items,
          coupon: cartData.coupon,
        };
        return resolve(payload);
      } else {
        const docRef = await addDoc(collection(db, "shoppingCart"), {
          ipAddress: ipAddress,
          items: [],
          coupon: {},
        });

        Cookies.set("shopcartId", docRef.id);

        const payload = {
          cartId: docRef.id,
          items: [],
          coupon: {},
        };
        console.log("El carro no existe.");
        return resolve(payload);
      }
    } else {
      const docRef = await addDoc(collection(db, "shoppingCart"), {
        ipAddress: ipAddress,
        items: [],
        coupon: {},
      });

      Cookies.set("shopcartId", docRef.id);

      const payload = {
        cartId: docRef.id,
        items: [],
        coupon: {},
      };
      console.log("El carro no existe.");
      return resolve(payload);
    }
  });
};*/

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
