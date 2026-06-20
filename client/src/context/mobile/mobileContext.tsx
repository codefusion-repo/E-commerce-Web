"use client";
// mobileContext.tsx

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Crear interface para MobileContextType
interface MobileContextType {
  hasWindow: boolean;
  device: number;
}

// Crear MobileContext
const MobileContext = createContext<MobileContextType | null>(null);

// Exportar MobileProvider
export const MobileProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [hasWindow, setHasWindow] = useState<boolean>(false);
  const [isSet, setIsSet] = useState<boolean>(false);

  const [device, setDevice] = useState<number>(4);

  useEffect(() => {
    if (!hasWindow) {
      if (typeof window !== "undefined") {
        setHasWindow(true);
      } else {
        setHasWindow(false);
      }
    }
  }, [hasWindow]);

  const adjustSize = useCallback(() => {
    const screenWidth = window.innerWidth;

    if (screenWidth < 480) {
      setDevice(0);
    } else if (screenWidth < 768) {
      setDevice(1);
    } else if (screenWidth < 1024) {
      setDevice(2);
    } else if (screenWidth < 1200) {
      setDevice(3);
    } else {
      setDevice(4);
    }
  }, []);

  useEffect(() => {
    if (hasWindow && !isSet) {
      adjustSize();
      setIsSet(true);
    }
  }, [adjustSize, hasWindow, isSet]);

  useEffect(() => {
    window.addEventListener("resize", adjustSize);
    return () => {
      window.removeEventListener("resize", adjustSize);
    };
  }, [adjustSize]);

  return (
    <MobileContext.Provider
      value={{
        hasWindow,
        device,
      }}
    >
      {children}
    </MobileContext.Provider>
  );
};

// Exportar useMobile para usar las variables de MobileContext
export const useMobile = () => {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error("useMobile must be used within a MobileProvider");
  }

  return context;
};
