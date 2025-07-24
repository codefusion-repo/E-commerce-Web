"use client";
// checkoutContext.tsx

import React, { ReactNode, createContext, useContext, useState } from "react";
import { AddressType } from "../../interfaces/auth/authInterface";

// Crear interface para CheckoutContextType
interface CheckoutContextType {
  deliveryPrice: number;
  setDeliveryPrice: (deliveryPrice: number) => void;

  selectedAddress?: AddressType;
  setSelectedAddress: (selectedAddress?: AddressType) => void;

  selectedCourier?: any;
  setSelectedCourier: (selectedCourier?: any) => void;

  checkoutStatus: number;
  setCheckoutStatus: (checkoutStatus: number) => void;
}

// Crear CheckoutContext
const CheckoutContext = createContext<CheckoutContextType | null>(null);

// Exportar CheckoutProvider
export const CheckoutProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);
  const [selectedAddress, setSelectedAddress] = useState<
    AddressType | undefined
  >(undefined);
  const [selectedCourier, setSelectedCourier] = useState<any | undefined>(
    undefined
  );

  const [checkoutStatus, setCheckoutStatus] = useState<number>(0);
  return (
    <CheckoutContext.Provider
      value={{
        deliveryPrice,
        setDeliveryPrice,
        selectedAddress,
        setSelectedAddress,
        selectedCourier,
        setSelectedCourier,
        checkoutStatus,
        setCheckoutStatus,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

// Exportar useCheckout para usar las variables de CheckoutContext
export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used inside a CheckoutProvider");
  }

  return context;
};
