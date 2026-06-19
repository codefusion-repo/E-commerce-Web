"use client";
// modalContext.tsx

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

// Crear interface para ModalContextType
interface ModalContextType {
  isOpen: boolean;
  type: string | null;

  message: string | null;
  setMessage: (message: string | null) => void;

  openModal: (type: string | null, message: string | null) => void;
  closeModal: () => void;
}

// Crear ModalContext
const ModalContext = createContext<ModalContextType | null>(null);

// Exportar ModalProvider
export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [type, setType] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const openModal = useCallback((type: string | null, message: string | null) => {
    setType(type);
    setMessage(message);
    setIsOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setMessage(null);
    setType(null);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        type,
        message,
        setMessage,
        openModal,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// Exportar useModal para usar las variables de ModalContext
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used inside a ModalProvider");
  }

  return context;
};
