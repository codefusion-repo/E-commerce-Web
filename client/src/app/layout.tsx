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
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { cookies } from "next/headers";
import { db } from "../context/firebase/firebaseInit";
import { MobileProvider } from "../context/mobile/mobileContext";
import { ShopcartProvider } from "../context/shopcart/shopcartContext";
import { CheckoutProvider } from "../context/checkout/checkoutContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-commerce-Web",
  description:
    "Effortlessly manage your e-commerce store and deliver a smooth shopping experience that keeps customers coming back. Designed to simplify online retail, this platform offers seamless browsing, fast loading times, and top-level security. Attract new customers and build loyalty by providing a trustworthy, enjoyable shopping experience from start to finish.",

  openGraph: {
    title: "E-commerce-Web",
    description:
      "Effortlessly manage your e-commerce store and deliver a smooth shopping experience that keeps customers coming back. Designed to simplify online retail, this platform offers seamless browsing, fast loading times, and top-level security. Attract new customers and build loyalty by providing a trustworthy, enjoyable shopping experience from start to finish.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN}/static/meta/opengraph-image.png`,
        width: 512,
        height: 512,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      `${process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN}/static/meta/twitter-image.png`,
    ],
  },
  icons: {
    icon: `${process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN}/static/meta/favicon.ico`, // Define favicon principal
    apple: `${process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN}/static/meta/apple-icon.png`, // Icono para Apple
    shortcut: `${process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN}/static/meta/icon.png`, // Icono de acceso directo
  },
};

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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL_DOCKER}/api/my/auth/refresh`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: Cookies.get("refresh")?.value }),
        cache: "no-store",
      }
    );
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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL_DOCKER}/api/my/auth/verify`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: Cookies.get("access")?.value }),
        cache: "no-store",
      }
    );
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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL_DOCKER}/api/user/get/profile`,
      {
        method: "GET",
        headers: {
          Authorization: `JWT ${access}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
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
// Función para obtener un carro de compras
async function getFirebaseShopcart(areCookiesActive: boolean) {
  try {
    const Cookies = cookies();
    if (areCookiesActive) {
      const cartId = Cookies.get("shopcartId")?.value;
      if (cartId) {
        return await getDocFromFirestore(cartId);
      } else {
        return await addDocToFirestore();
      }
    } else {
      return await defaultCartReturn();
    }
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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL_DOCKER}/api/shop/get/categories`,
      { cache: "no-store" }
      // { next: { revalidate: 1600 } }
    );
    if (res.status === 200) {
      const data = await res.json();
      shopData.categories = data.categories;
    }
  } catch (err) {
    // throw new Error("It was not possible to obtain the necessary information");
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL_DOCKER}/api/shop/get/products`,
      { cache: "no-store" }
      // { next: { revalidate: 1600 } }
    );
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

  const cartData = await getFirebaseShopcart(settingsData.areCookiesActive);

  return (
    <html lang="en">
      <body>
        <MobileProvider>
          <FirebaseProvider>
            <MessagesProvider>
              <SettingsProvider settingsData={settingsData}>
                <AuthProvider authData={authData}>
                  <ShopProvider shopData={shopData}>
                    <CheckoutProvider>
                      <ShopcartProvider cartData={cartData}>
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
        </MobileProvider>
      </body>
    </html>
  );
}
