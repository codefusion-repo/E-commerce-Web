"use client";
// settingsContext.tsx

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { RiLockPasswordFill, RiTwitterXFill } from "react-icons/ri";
import { User } from "firebase/auth";
import Cookies from "js-cookie";
import { ProvidersType } from "../../interfaces/settings/settingsInterface";

// Crear interface para el SettingsContextType
interface SettingsContextType {
  linkedProviders: ProvidersType[] | null;
  syncProviders: (firebaseUser: User) => void;

  areMessagesActive: boolean;
  activateMessages: () => void;
  deactivateMessages: () => void;

  areCookiesActive: boolean;
  activateCookies: () => void;
  deactivateCookies: () => void;
}

// Definir los proveedores disponibles
const availableProviders: ProvidersType[] = [
  {
    icon: <RiLockPasswordFill className="zoom-in-xxl" />,
    providerId: "password",
    providerName: "Password",
    email: null,
    name: null,
    linked: false,
  },
  {
    icon: <FaGoogle className="zoom-in-xxl" />,
    providerId: "google.com",
    providerName: "Google",
    email: null,
    name: null,
    linked: false,
  },
  {
    icon: <FaFacebook className="zoom-in-xxl" />,
    providerId: "facebook.com",
    providerName: "Facebook",
    email: null,
    name: null,
    linked: false,
  },
  {
    icon: <RiTwitterXFill className="zoom-in-xxl" />,
    providerId: "twitter.com",
    providerName: "X (Twitter)",
    email: null,
    name: null,
    linked: false,
  },
];

// Crear SettingsContext
const SettingsContext = createContext<SettingsContextType | null>(null);

// Exportar SettingsProvider
export const SettingsProvider: React.FC<{
  children: ReactNode;
  settingsData: {
    areMessagesActive: boolean;
    areCookiesActive: boolean;
  };
}> = ({ children, settingsData }) => {
  const [linkedProviders, setLinkedProviders] = useState<
    ProvidersType[] | null
  >(null);

  useEffect(() => {
    const defaultProviders = () => {
      if (!linkedProviders) {
        const updatedProviders = availableProviders.map((provider) => ({
          ...provider,
        }));

        setLinkedProviders(updatedProviders);
      }
    };

    defaultProviders();
  }, [linkedProviders]);
  const syncProviders = (firebaseUser: User) => {
    const updatedProviders = availableProviders.map((provider) => ({
      ...provider,
    }));

    firebaseUser?.providerData?.forEach((linkedProvider) => {
      const provider = updatedProviders.find(
        (p) => p.providerId === linkedProvider.providerId
      );
      if (provider) {
        provider.email = linkedProvider.email;
        provider.name = linkedProvider.displayName;
        provider.linked = true;
      }
    });

    setLinkedProviders(updatedProviders);
  };

  const [areMessagesActive, setAreMessagesActive] = useState<boolean>(
    settingsData.areMessagesActive
  );
  const [areCookiesActive, setAreCookiesActive] = useState<boolean>(
    settingsData.areCookiesActive
  );

  const activateMessages = () => {
    Cookies.set("areMessagesActive", "true");

    setAreMessagesActive(true);
  };

  const deactivateMessages = () => {
    Cookies.set("areMessagesActive", "false");

    setAreMessagesActive(false);
  };

  const activateCookies = () => {
    Cookies.set("areCookiesActive", "true");

    setAreCookiesActive(true);
  };

  const deactivateCookies = () => {
    Cookies.set("areCookiesActive", "false");

    setAreCookiesActive(false);
  };

  /*useEffect(() => {
    const fetchCookies = () => {
      if (Cookies.get("areMessagesActive")) {
        const areMessagesActiveCookie = Cookies.get("areMessagesActive");
        if (areMessagesActiveCookie === "true") {
          deactivateMessages();
        } else if (areMessagesActiveCookie === "false") {
          activateMessages();
        }
      } else {
        activateMessages();
      }

      if (Cookies.get("areCookiesActive")) {
        const areCookiesActiveCookie = Cookies.get("areCookiesActive");
        if (areCookiesActiveCookie === "true") {
          deactivateCookies();
        } else if (areCookiesActiveCookie === "false") {
          activateCookies();
        }
      } else {
        activateCookies();
      }
    };

    return fetchCookies();
  }, []);*/

  return (
    <SettingsContext.Provider
      value={{
        linkedProviders,
        syncProviders,

        areMessagesActive,
        activateMessages,
        deactivateMessages,

        areCookiesActive,
        activateCookies,
        deactivateCookies,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Exportar useSettings para usar las variables de SettingsContext
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings should be used inside a SettingsProvider");
  }

  return context;
};
