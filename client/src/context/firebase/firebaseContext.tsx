"use client";
// firebaseContext.tsx

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import { auth, db } from "./firebaseInit";

// Crear interface para FirebaseContextType
interface FirebaseContextType {
  auth: Auth;
  db: Firestore;
}

// Estado inicial de FirebaseContextType
const initialState: FirebaseContextType = {
  auth: auth,
  db: db,
};

// Crear FirebaseContext
const FirebaseContext = createContext<FirebaseContextType>(initialState);

// Exportar FirebaseProvider
export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <FirebaseContext.Provider value={{ auth, db }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Exportar useFirebase para usar las variables de FirebaseContext
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used inside a FirebaseProvider");
  }

  return context;
};
