"use client";
// shopcartContext.tsx

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CouponType, ProductType } from "../../interfaces/shop/shopInterface";
import { useSettings } from "../settings/settingsContext";
import Cookies from "js-cookie";
import { updateShopcartInFirestore } from "./api/action";
import { useFirebase } from "../firebase/firebaseContext";
import { useCheckout } from "../checkout/checkoutContext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../auth/authContext";
import { onAuthStateChanged } from "firebase/auth";
import { UserCouponType } from "@/interfaces/auth/authInterface";

// Crear interface para ShopcartContextType
interface ShopcartContextType {
  items?: ProductType[];
  coupon?: UserCouponType | undefined;

  addItem: (item: ProductType) => void;
  removeItem: (item: ProductType) => void;
  removeUnitFromItem: (item: ProductType) => void;
  updateItemQuantity: (item: ProductType, quantity: number) => void;
  clearShop: () => void;

  setCoupon: (coupon: UserCouponType | undefined) => void;

  subtotal: number;
  total: number;
}

// Crear ShopcartContext
const ShopcartContext = createContext<ShopcartContextType | null>(null);

export function mergeCarts(
  serverCart: ProductType[] = [],
  localCart: ProductType[] = []
): ProductType[] {
  const merged: Record<string, ProductType> = {};

  for (const item of serverCart) {
    merged[item.id] = { ...item };
  }

  for (const item of localCart) {
    if (merged[item.id]) {
      // Ya existe, sumamos cantidades
      merged[item.id].quantity = item.quantity;
    } else {
      merged[item.id] = { ...item };
    }
  }

  return Object.values(merged);
}

// Exportar ShopcartProvider
export const ShopcartProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [coupon, setCoupon] = useState<UserCouponType | undefined>(undefined);
  const [items, setItems] = useState<ProductType[] | undefined>([]);
  const itemsRef = useRef<ProductType[] | undefined>(items);

  const { deliveryPrice } = useCheckout();
  const [total, setTotal] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);

  const { areCookiesActive } = useSettings();
  const { auth, db } = useFirebase();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const syncLocalCart = useCallback(() => {
    const cart = localStorage.getItem("cart");
    if (cart) {
      const localCart = JSON.parse(cart);
      setItems(localCart.items);
      setCoupon(localCart.coupon);
    }
  }, []);

  async function updateShopcart(
    items: ProductType[],
    user_id: string | undefined,
    isAuthenticated: boolean
  ) {
    if (isAuthenticated && user_id) {
      const cartRef = doc(db, "carts", user_id);
      await updateDoc(cartRef, {
        items: items,
      });
    }

    localStorage.setItem("cart", JSON.stringify({ items: items }));
  }

  const syncCartWithFirestore = useCallback(async (userUid: string) => {
    const localCart = JSON.parse(localStorage.getItem("cart") || "{}");

    const cartRef = doc(db, "carts", userUid);
    const cartSnap = await getDoc(cartRef);

    let finalCart: ProductType[] = [];

    if (cartSnap.exists()) {
      const serverCart = cartSnap.data();
      finalCart = mergeCarts(serverCart.items || [], localCart.items || []);
    } else {
      finalCart = localCart.items || [];
    }

    await setDoc(cartRef, {
      items: finalCart,
    });

    localStorage.setItem("cart", JSON.stringify({ items: itemsRef.current }));

    setItems(finalCart || []);
  }, [db]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        syncCartWithFirestore(user.uid);
      }
    });

    return () => unsubscribe();
  }, [auth, syncCartWithFirestore]);

  useEffect(() => {
    if (localStorage.getItem("cart")) {
      syncLocalCart();
    }
  }, [syncLocalCart]);

  useEffect(() => {
    const getTotal = (i: ProductType[]) => {
      let s = 0;

      i?.forEach((item) => {
        let inputs = document.querySelectorAll(
          `#input_${item.id}`
        ) as NodeListOf<HTMLInputElement>;
        if (inputs) {
          inputs.forEach((input) => {
            input.value = item.quantity.toString();
          });
        }
        s += item.price * item.quantity;
      });
      setSubtotal(s);

      let t = 0;

      t = s + deliveryPrice;

      let discount: number = 0;
      if (coupon) {
        if (coupon.coupon.discount_type === "value") {
          discount = coupon.coupon.discount_value;
        } else if (coupon.coupon.discount_type === "percent") {
          discount = Math.round((t * coupon.coupon.discount_percent) / 100);
        } else if (coupon.coupon.discount_type === "free_delivery") {
          discount = deliveryPrice;
        }
      }

      t = t - discount;

      setTotal(t);
    };

    if (items) {
      getTotal(items);
    }
  }, [items, deliveryPrice, coupon]);

  const addItem = (item: ProductType) => {
    setItems((prevState) => {
      if (!prevState) {
        return;
      }
      // Encuentra el ítem en el arreglo
      const itemIndex = prevState.findIndex((i: any) => i.id === item.id);

      // Utiliza el operador ternario para agregar uno más al ítem existente o agregar un nuevo ítem
      const updatedItems =
        itemIndex !== -1
          ? prevState.map((i: any, index: any) =>
              index === itemIndex ? { ...i, quantity: i.quantity + 1 } : i
            )
          : [...prevState, { ...item, quantity: 1 }]; // Asegúrate de establecer una cantidad inicial si es necesario

      updateShopcart(updatedItems, user?.id, isAuthenticated);
      return updatedItems;
    });
  };
  const removeItem = (item: ProductType) => {
    setItems((prevState) => {
      if (!prevState) {
        return;
      }
      // Encuentra el ítem en el arreglo
      const itemIndex = prevState.findIndex((i) => i.id === item.id);

      // Utiliza el operador ternario para eliminar el ítem si existe
      const updatedItems =
        itemIndex !== -1
          ? prevState.filter((i, index) => index !== itemIndex)
          : prevState;
      updateShopcart(updatedItems, user?.id, isAuthenticated);
      return updatedItems;
    });
  };
  const removeUnitFromItem = (item: ProductType) => {
    setItems((prevState) => {
      if (!prevState) {
        return;
      }
      const itemIndex = prevState.findIndex((i) => i.id === item.id);

      // Utiliza el operador ternario para reducir la cantidad o eliminar el ítem
      const updatedItems =
        itemIndex !== -1
          ? prevState[itemIndex].quantity > 1
            ? prevState.map((i, index) =>
                index === itemIndex ? { ...i, quantity: i.quantity - 1 } : i
              )
            : prevState.filter((i, index) => index !== itemIndex)
          : prevState;
      updateShopcart(updatedItems, user?.id, isAuthenticated);
      return updatedItems;
    });
  };
  const updateItemQuantity = (item: ProductType, quantity: number) => {
    setItems((prevState) => {
      if (!prevState) {
        return;
      }
      const itemIndex = prevState.findIndex((i) => i.id === item.id);

      // Utiliza el operador ternario para actualizar la cantidad o eliminar el ítem
      const updatedItems =
        itemIndex !== -1
          ? quantity > 0
            ? prevState.map((i, index) =>
                index === itemIndex ? { ...i, quantity } : i
              )
            : prevState.filter((i, index) => index !== itemIndex)
          : quantity > 0
          ? [...prevState, { ...item, quantity: quantity }]
          : prevState;

      updateShopcart(updatedItems, user?.id, isAuthenticated);
      return updatedItems;
    });
  };
  const clearShop = () => {
    setItems((prevState) => {
      if (!prevState) {
        return;
      }
      const updatedItems: ProductType[] = [];
      updateShopcart(updatedItems, user?.id, isAuthenticated);
      return updatedItems;
    });

    setCoupon(undefined);
  };

  return (
    <ShopcartContext.Provider
      value={{
        items,
        coupon,
        addItem,
        removeItem,
        removeUnitFromItem,
        updateItemQuantity,
        clearShop,
        setCoupon,
        subtotal,
        total,
      }}
    >
      {children}
    </ShopcartContext.Provider>
  );
};

// Exportar useShopcart para usar las variables de ShopcartContext
export const useShopcart = () => {
  const context = useContext(ShopcartContext);
  if (!context) {
    throw new Error("useShopcart must be used within a ShopcartProvider");
  }

  return context;
};
