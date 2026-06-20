"use client";
// shopContext.tsx

import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  CategoryType,
  OrderByType,
  ProductType,
} from "../../interfaces/shop/shopInterface";

// Definir los ordenes de producto disponibles
export const availableOrders: OrderByType[] = [
  {
    type: "df",
    name: "Default order",
  },
  {
    type: "mp",
    name: "Most popular",
  },
  {
    type: "az",
    name: "Alphabetically, A - Z",
  },
  {
    type: "za",
    name: "Alphabetically, Z - A",
  },
  {
    type: "me",
    name: "Price, Lowest - Highest",
  },
  {
    type: "ma",
    name: "Price, Highest - Lowest",
  },
  {
    type: "ra",
    name: "Date, Recent - Old",
  },
  {
    type: "ar",
    name: "Date, Old - Recent",
  },
];

// Crear interface para ShopContextType
interface ShopContextType {
  availableOrderBy: OrderByType[];

  allCategories: CategoryType[];
  categories: CategoryType[];
  brands: CategoryType[];
  specialCategories: CategoryType[];
  products: ProductType[];
  setProducts: Dispatch<SetStateAction<ProductType[]>>;

  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// Crear ShopContext
const ShopContext = createContext<ShopContextType | null>(null);

// Exportar ShopProvider
export const ShopProvider: React.FC<{
  children: ReactNode;
  shopData: {
    categories: CategoryType[];
    products: ProductType[];
  };
}> = ({ children, shopData }) => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [brands, setBrands] = useState<CategoryType[]>([]);
  const [specialCategories, setSpecialCategories] = useState<CategoryType[]>(
    []
  );
  const [allCategories, setAllCategories] = useState<CategoryType[]>(
    shopData.categories
  );
  const [products, setProducts] = useState<ProductType[]>(shopData.products);

  useEffect(() => {
    setCategories(shopData.categories.filter((c) => c.type === "category"));
    setBrands(shopData.categories.filter((b) => b.type === "brand"));
    setSpecialCategories(
      shopData.categories.filter((s) => s.type === "special")
    );
  }, [shopData.categories]);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [availableOrderBy, setAvailableOrderBy] =
    useState<OrderByType[]>(availableOrders);

  return (
    <ShopContext.Provider
      value={{
        availableOrderBy,

        allCategories,
        categories,
        brands,
        specialCategories,
        products,
        setProducts,

        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

// Exportar useShop para usar las variables de ShopContext
export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used inside a ShopProvider");
  }

  return context;
};
