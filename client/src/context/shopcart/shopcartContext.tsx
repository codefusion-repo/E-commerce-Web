"use client";
// shopcartContext.tsx

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { CouponType, ProductType } from "../../interfaces/shop/shopInterface";
import { useSettings } from "../settings/settingsContext";
import Cookies from "js-cookie";
import { updateShopcartInFirestore } from "./api/action";
import { useFirebase } from "../firebase/firebaseContext";
import { useCheckout } from "../checkout/checkoutContext";

// Crear interface para ShopcartContextType
interface ShopcartContextType {
  cartId?: string;
  items?: ProductType[];

  addItem: (item: ProductType) => void;
  removeItem: (item: ProductType) => void;
  removeUnitFromItem: (item: ProductType) => void;
  updateItemQuantity: (item: ProductType, quantity: number) => void;
  clearShop: () => void;

  updateItemsFirebase: (
    items: ProductType[],
    cartId: string,
    coupon?: CouponType
  ) => void;

  discount: number;
  setDiscount: (discount: number) => void;
  coupon?: CouponType;
  setCoupon: (coupon: CouponType | undefined) => void;

  subtotal: number;
  total: number;
}

// Crear ShopcartContext
const ShopcartContext = createContext<ShopcartContextType | null>(null);

// Exportar ShopcartProvider
export const ShopcartProvider: React.FC<{
  children: ReactNode;
  cartData: {
    cartId: string;
    items: ProductType[];
    coupon: CouponType;
  };
}> = ({ children, cartData }) => {
  const [cartId, setCartId] = useState<string>(cartData.cartId);
  const [coupon, setCoupon] = useState<CouponType | undefined>(cartData.coupon);
  const [items, setItems] = useState<ProductType[] | undefined>(
    cartData.items ? cartData.items : []
  );

  const [discount, setDiscount] = useState<number>(0);
  const { deliveryPrice } = useCheckout();
  const [total, setTotal] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);

  const { areCookiesActive } = useSettings();

  useEffect(() => {
    if (cartData.cartId !== "default" && areCookiesActive) {
      Cookies.set("shopcartId", cartData.cartId);
    }
  }, []);

  useEffect(() => {
    if (coupon) {
      if (coupon.discount_type === "value") {
        setDiscount(coupon.discount_value);
      } else if (coupon.discount_type === "percent") {
        setDiscount((subtotal * coupon.discount_percent) / 100);
      }
    }
  }, [coupon]);

  useEffect(() => {
    const getTotal = (i: ProductType[]) => {
      let subtotal = 0;
      let total = 0;
      i?.forEach((item) => {
        let inputs = document.querySelectorAll(
          `#input_${item.id}`
        ) as NodeListOf<HTMLInputElement>;
        if (inputs) {
          inputs.forEach((input) => {
            input.value = item.quantity.toString();
          });
        }
        subtotal += item.price * item.quantity;
      });

      total = subtotal + deliveryPrice - discount;

      setSubtotal(subtotal);
      setTotal(total);
    };

    if (items) {
      getTotal(items);
    }
  }, [items, deliveryPrice, discount]);

  const { db } = useFirebase();

  const updateItemsFirebase = (
    items: ProductType[],
    cartId: string,
    coupon: CouponType | undefined
  ) => {
    updateShopcartInFirestore(items, cartId, coupon, db);
  };
  const addItem = (item: ProductType) => {
    setItems((prevState) => {
      if (!prevState) {
        return;
      }
      // Encuentra el ítem en el arreglo
      const itemIndex = prevState.findIndex((i) => i.id === item.id);

      // Utiliza el operador ternario para agregar uno más al ítem existente o agregar un nuevo ítem
      const updatedItems =
        itemIndex !== -1
          ? prevState.map((i, index) =>
              index === itemIndex ? { ...i, quantity: i.quantity + 1 } : i
            )
          : [...prevState, { ...item, quantity: 1 }]; // Asegúrate de establecer una cantidad inicial si es necesario

      if (cartId) {
        updateItemsFirebase(updatedItems, cartId, coupon);
      }
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
      if (cartId) {
        updateItemsFirebase(updatedItems, cartId, coupon);
      }
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
      if (cartId) {
        updateItemsFirebase(updatedItems, cartId, coupon);
      }
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

      if (cartId) {
        updateItemsFirebase(updatedItems, cartId, coupon);
      }
      return updatedItems;
    });
  };
  const clearShop = () => {
    setItems((prevState) => {
      if (!prevState) {
        return;
      }
      const updatedItems: ProductType[] = [];
      return updatedItems;
    });

    setCoupon(undefined);
    setDiscount(0);

    if (cartId) {
      updateItemsFirebase([], cartId, undefined);
    }
  };

  return (
    <ShopcartContext.Provider
      value={{
        cartId,
        items,
        addItem,
        removeItem,
        removeUnitFromItem,
        updateItemQuantity,
        clearShop,
        updateItemsFirebase,
        discount,
        setDiscount,
        coupon,
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
