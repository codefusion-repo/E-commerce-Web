export const DEFAULT_LOCALE = "es";
export const LOCALE_COOKIE_NAME = "cf_locale";
export const LOCALE_STORAGE_KEY = "codefusion-demo-locale";

export const SUPPORTED_LOCALES = ["es", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

type LocaleMetadata = {
  title: string;
  description: string;
  openGraphLocale: string;
  imageAlt: string;
};

export const LOCALE_DETAILS: Record<
  Locale,
  {
    label: string;
    nativeLabel: string;
    shortLabel: string;
    htmlLang: string;
    metadata: LocaleMetadata;
  }
> = {
  es: {
    label: "Español",
    nativeLabel: "Español",
    shortLabel: "ES",
    htmlLang: "es-CL",
    metadata: {
      title: "CodeFusion E-commerce Demo",
      description:
        "Demo e-commerce de CodeFusion con catálogo, carrito, cupones, checkout con Flow y gestión básica de pedidos para mostrar una experiencia de compra completa sin usar datos sensibles.",
      openGraphLocale: "es_CL",
      imageAlt: "Vista previa de CodeFusion E-commerce Demo",
    },
  },
  en: {
    label: "Inglés",
    nativeLabel: "English",
    shortLabel: "EN",
    htmlLang: "en",
    metadata: {
      title: "CodeFusion E-commerce Demo",
      description:
        "CodeFusion e-commerce demo with catalog, cart, coupons, Flow checkout, and basic order management to show a complete shopping experience without sensitive data.",
      openGraphLocale: "en_US",
      imageAlt: "CodeFusion E-commerce Demo preview",
    },
  },
};

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : DEFAULT_LOCALE;
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "es" || value === "en";
}
