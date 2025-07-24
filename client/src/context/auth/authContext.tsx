"use client";
// authContext.tsx

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { useFirebase } from "../firebase/firebaseContext";
import { postVerifyFirebaseIdToken } from "./api/action";
import { useMessages } from "../messages/messagesContext";
import { usePathname, useRouter } from "next/navigation";
import { useSettings } from "../settings/settingsContext";
import Cookies from "js-cookie";
import { UserType } from "../../interfaces/auth/authInterface";

// Crear interface para AuthContextType
interface AuthContextType {
  firebaseUser: User | null;
  user?: UserType;
  isAuthenticated: boolean;

  setAuthType: (authType: string) => void;

  setUser: (user?: UserType) => void;
  setFirebaseUser: (user: User) => void;

  updateAuthState: (user: UserType, access?: string, refresh?: string) => void;

  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void;
}

// Crear AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

// Exportar AuthProvider
export const AuthProvider: React.FC<{
  children: ReactNode;
  authData: {
    isAuthenticated: boolean;
    user?: UserType;
    access?: string;
    refresh?: string;
  };
}> = ({ children, authData }) => {
  const { auth } = useFirebase();
  const { addMessage } = useMessages();
  const { syncProviders } = useSettings();

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  const [user, setUser] = useState<UserType | undefined>(authData.user);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    authData.isAuthenticated
  );

  const [authType, setAuthType] = useState<string>("refresh");

  const pathname = usePathname();

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = () => {
      onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);

        if (user) {
          syncProviders(user);
        }
      });
    };
    unsubscribe();
  }, [pathname, isAuthenticated]);

  useEffect(() => {
    if (authType === "refresh") {
      updateAuthState(authData.user, authData.access, authData.refresh);
    }
  }, [authType, authData]);

  useEffect(() => {
    if (firebaseUser && authType === "refresh") {
      if (isAuthenticated) {
        firebaseUser
          .getIdToken(false)
          .then((idToken) => {
            let token = idToken;
            let email = firebaseUser.email ? firebaseUser.email : "";
            postVerifyFirebaseIdToken(token, email)
              .then(() => {
                addMessage("Active session in progress");
                setAuthType("authenticated");
              })
              .catch((err) => {
                console.log(err);
                signOutAuthState();
              });
          })
          .catch((err) => {
            console.log(err.code);
            signOutAuthState();
          });
      } else {
        signOutAuthState();
      }
    }
  }, [firebaseUser, authType]);

  const updateAuthState = (
    user?: UserType,
    access?: string,
    refresh?: string
  ) => {
    console.log("access: ", access);
    console.log("refresh: ", refresh);

    if (user && access && refresh) {
      Cookies.set("access", access);
      Cookies.set("refresh", refresh);
      setUser(user);
      setIsAuthenticated(true);
    }
  };

  const signOutAuthState = (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => {
    signOut(auth)
      .then(() => {
        reSignOut();
      })
      .catch((err) => {
        console.log(err.code);
        reSignOut();
      });

    if (message) {
      addMessage(message);
    }

    if (needRedirection) {
      router.push("/");
    }

    if (needRefresh) {
      router.refresh();
    }
  };

  const reSignOut = () => {
    Cookies.remove("access");
    Cookies.remove("refresh");

    setUser(undefined);
    setFirebaseUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        isAuthenticated,

        setAuthType,
        setUser,
        setFirebaseUser,
        updateAuthState,
        signOutAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Exportar useAuth para usar las variables de AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
