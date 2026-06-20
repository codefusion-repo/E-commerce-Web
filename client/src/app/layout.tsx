// `app/layout.tsx`

import { FirebaseProvider } from "../context/firebase/firebaseContext";
import { MessagesProvider } from "../context/messages/messagesContext";
import { SettingsProvider } from "../context/settings/settingsContext";
import { AuthProvider } from "../context/auth/authContext";
import { ShopProvider } from "../context/shop/shopContext";
import { ModalProvider } from "../context/modal/modalContext";
import Modal from "../components/modal/modal";
import Messages from "../components/messages/messages";
import "../style/new-general-style.css";
// import "../style/general-style.css";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { cookies } from "next/headers";
import { db } from "../context/firebase/firebaseInit";
import { MobileProvider } from "../context/mobile/mobileContext";
import { ShopcartProvider } from "../context/shopcart/shopcartContext";
import { CheckoutProvider } from "../context/checkout/checkoutContext";
import type { Metadata } from "next";
import { serverApiUrl } from "../utils/api";
import { I18nProvider } from "../i18n/client";
import { LOCALE_COOKIE_NAME, LOCALE_DETAILS, normalizeLocale } from "../i18n/config";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ecommerce-demo.codefusion.cl";
const mediaBaseUrl =
  process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN || siteUrl;
const mediaUrl = (path: string) => new URL(path, mediaBaseUrl).toString();

function getServerLocale() {
  return normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = getServerLocale();
  const localeMetadata = LOCALE_DETAILS[locale].metadata;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: localeMetadata.title,
      template: `%s | ${localeMetadata.title}`,
    },
    description: localeMetadata.description,
    applicationName: "CodeFusion E-commerce Demo",
    keywords: [
      "CodeFusion",
      "e-commerce demo",
      "checkout Flow",
      "Next.js",
      "Django",
      "portfolio",
    ],
    alternates: {
      canonical: "/",
    },

    openGraph: {
      title: localeMetadata.title,
      description: localeMetadata.description,
      url: "/",
      siteName: "CodeFusion E-commerce Demo",
      locale: localeMetadata.openGraphLocale,
      type: "website",
      images: [
        {
          url: mediaUrl("/static/meta/opengraph-image.png"),
          width: 512,
          height: 512,
          alt: localeMetadata.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: localeMetadata.title,
      description: localeMetadata.description,
      images: [mediaUrl("/static/meta/twitter-image.png")],
    },
    icons: {
      icon: mediaUrl("/static/meta/favicon.ico"),
      apple: mediaUrl("/static/meta/apple-icon.png"),
      shortcut: mediaUrl("/static/meta/icon.png"),
    },
  };
}

// Función de retorno por default
async function defaultAuthReturn() {
  return {
    isAuthenticated: false,
    user: undefined,
    access: undefined,
    refresh: undefined,
  };
}
// Función para refrescar el token de acceso si este a expirado
async function postJWTRefreshToken() {
  try {
    const Cookies = cookies();
    if (!Cookies.get("refresh")) {
      return await defaultAuthReturn();
    }
    const res = await fetch(serverApiUrl("/api/my/auth/refresh"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: Cookies.get("refresh")?.value }),
      cache: "no-store",
    });
    if (res.status === 200) {
      const data = await res.json();
      const user = await getUser(data.access);
      return {
        isAuthenticated: true,
        user: user,
        access: data.access,
        refresh: data.refresh,
      };
    } else {
      return await defaultAuthReturn();
    }
  } catch {
    return await defaultAuthReturn();
  }
}
// Función para verificar el token de acceso
async function postJWTVerifyToken() {
  try {
    const Cookies = cookies();
    if (!Cookies.get("access")) {
      return await defaultAuthReturn();
    }
    const res = await fetch(serverApiUrl("/api/my/auth/verify"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: Cookies.get("access")?.value }),
      cache: "no-store",
    });
    if (res.status === 200) {
      const user = await getUser(Cookies.get("access")?.value);
      return {
        isAuthenticated: true,
        user: user,
        access: Cookies.get("access")?.value,
        refresh: Cookies.get("refresh")?.value,
      };
    } else {
      return await postJWTRefreshToken();
    }
  } catch {
    return await defaultAuthReturn();
  }
}
// Función para obtener la data del user
async function getUser(access: string | undefined) {
  try {
    if (!access) {
      return undefined;
    }
    const res = await fetch(serverApiUrl("/api/user/get/profile"), {
      method: "GET",
      headers: {
        Authorization: `JWT ${access}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (res.status === 200) {
      const data = await res.json();
      return data.user;
    } else {
      return undefined;
    }
  } catch {
    return undefined;
  }
}
// Función para agregar un carro a Firestore
async function defaultCartReturn() {
  return {
    cartId: "default",
    items: undefined,
    coupon: undefined,
  };
}
// Función para agregar un carro a Firestore
async function addDocToFirestore() {
  try {
    const docRef = await addDoc(collection(db, "shoppingCart"), {
      items: [],
      coupon: {},
    });
    return {
      cartId: docRef.id,
      items: undefined,
      coupon: undefined,
    };
  } catch {
    return await defaultCartReturn();
  }
}
// Función para obtener un carro de Firestore
async function getDocFromFirestore(cartId: string) {
  try {
    const cartRef = doc(db, "shoppingCart", cartId);
    const cartSnapshot = await getDoc(cartRef);
    if (cartSnapshot.exists()) {
      const cartData = cartSnapshot.data();
      return {
        cartId: cartId,
        items: cartData.items,
        coupon: cartData.coupon,
      };
    } else {
      return await addDocToFirestore();
    }
  } catch {
    return await defaultCartReturn();
  }
}

// Nueva función para manejar el carrito de compras
async function fetchShopcart(user: any, isAuthenticated: boolean) {
  if (isAuthenticated) {
    const docRef = doc(db, "carts", user?.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return;
    } else {
      // docSnap.data() will be undefined in this case
      return;
    }
  }
}
// Función para obtener un carro de compras
async function getFirebaseShopcart(
  areCookiesActive: boolean,
  user: any,
  isAuthenticated: boolean
) {
  try {
    if (isAuthenticated) {
      const cartRef = doc(db, "shoppingCart", user?.id);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        return await defaultCartReturn();
      } else {
        await setDoc(doc(db, "shoppingCart", user?.id), {
          items: [],
          coupon: {},
        });

        return await defaultCartReturn();
      }
    }
    return await defaultCartReturn();
    /*const Cookies = cookies();
    if (areCookiesActive) {
      const cartId = Cookies.get("shopcartId")?.value;
      if (cartId) {
        return await getDocFromFirestore(cartId);
      } else {
        return await addDocToFirestore();
      }
    } else {
      return await defaultCartReturn();
    }*/
  } catch {
    return await defaultCartReturn();
  }
}
// Función para obtener la configuración actual
async function getSettings() {
  const settingsData = {
    areMessagesActive: true,
    areCookiesActive: true,
  };
  try {
    const Cookies = cookies();
    if (Cookies.get("areMessagesActive")?.value === "false") {
      settingsData.areMessagesActive = false;
    }
    if (Cookies.get("areCookiesActive")?.value === "false") {
      settingsData.areCookiesActive = false;
    }
    return settingsData;
  } catch {
    return settingsData;
  }
}

// Función para obtener información de la tienda
async function getShopData() {
  const shopData = {
    categories: [],
    products: [],
  };

  try {
    const res = await fetch(serverApiUrl("/api/shop/get/categories"), {
      next: { revalidate: 1600 },
    });
    if (res.status === 200) {
      const data = await res.json();
      shopData.categories = data.categories;
    }
  } catch (err) {
    // throw new Error("It was not possible to obtain the necessary information");
  }

  try {
    const res = await fetch(serverApiUrl("/api/shop/get/products"), {
      next: { revalidate: 1600 },
    });
    if (res.status === 200) {
      const data = await res.json();
      shopData.products = data.products;
    }
  } catch (err) {
    //throw new Error("It was not possible to obtain the necessary information");
  }

  return shopData;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settingsData = await getSettings();

  const authData = await postJWTVerifyToken();

  const shopData = await getShopData();
  const locale = getServerLocale();

  // const cartData = await fetchShopcart(authData.user, authData.isAuthenticated);

  return (
    <html lang={LOCALE_DETAILS[locale].htmlLang}>
      <body>
        <MobileProvider>
          <I18nProvider initialLocale={locale}>
            <FirebaseProvider>
              <MessagesProvider>
                <SettingsProvider settingsData={settingsData}>
                  <AuthProvider authData={authData}>
                    <ShopProvider shopData={shopData}>
                      <CheckoutProvider>
                        <ShopcartProvider>
                          <ModalProvider>
                            {children}
                            <Modal />
                            <Messages />
                          </ModalProvider>
                        </ShopcartProvider>
                      </CheckoutProvider>
                    </ShopProvider>
                  </AuthProvider>
                </SettingsProvider>
              </MessagesProvider>
            </FirebaseProvider>
          </I18nProvider>
        </MobileProvider>
      </body>
    </html>
  );
}
