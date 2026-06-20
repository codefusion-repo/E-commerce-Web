"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_DETAILS,
  LOCALE_STORAGE_KEY,
  Locale,
  isLocale,
  normalizeLocale,
} from "./config";
import { ENGLISH_TO_SPANISH, SPANISH_TO_ENGLISH } from "./dictionaries";

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (text: string) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);
const textSources = new WeakMap<Text, string>();
const attrSources = new WeakMap<Element, Map<string, string>>();
const TRANSLATABLE_ATTRIBUTES = ["placeholder", "aria-label", "title", "alt"];
const SKIPPED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "TEXTAREA",
  "CODE",
  "PRE",
  "NOSCRIPT",
]);

let isApplyingTranslations = false;

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function preserveOuterWhitespace(source: string, translated: string) {
  const leading = source.match(/^\s*/)?.[0] ?? "";
  const trailing = source.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translated}${trailing}`;
}

function findUppercaseMatch(
  source: string,
  dictionary: Record<string, string>,
  locale: Locale
) {
  const sourceUpper = source.toLocaleUpperCase(locale === "en" ? "en" : "es-CL");

  if (source !== sourceUpper) {
    return undefined;
  }

  const match = Object.entries(dictionary).find(
    ([key]) =>
      key.toLocaleUpperCase(locale === "en" ? "en" : "es-CL") === sourceUpper
  );

  return match?.[1].toLocaleUpperCase(locale === "en" ? "en" : "es-CL");
}

function translateTemplates(source: string, locale: Locale): string | undefined {
  const translateSegment = (value: string) => translateNormalized(value, locale);

  if (locale === "en") {
    const productsCount = source.match(/^(\d+) productos$/);
    if (productsCount) {
      return `${productsCount[1]} products`;
    }

    const seconds = source.match(/^\[(\d+) seg\]$/);
    if (seconds) {
      return `[${seconds[1]} sec]`;
    }

    const foundProducts = source.match(/^Productos encontrados: (\d+)$/);
    if (foundProducts) {
      return `Products found: ${foundProducts[1]}`;
    }

    const cartUnits = source.match(/^Tienes (\d+) unidades en el carrito$/);
    if (cartUnits) {
      return `You have ${cartUnits[1]} units in the cart`;
    }

    const cartProducts = source.match(/^Tienes (\d+) productos en el carrito$/);
    if (cartProducts) {
      return `You have ${cartProducts[1]} products in the cart`;
    }

    const cartProduct = source.match(/^Tienes (\d+) producto en el carrito$/);
    if (cartProduct) {
      return `You have ${cartProduct[1]} product in the cart`;
    }

    if (source === "No hay productos en el carrito") {
      return "There are no products in the cart";
    }

    const subtotal = source.match(/^Subtotal: (.+)$/);
    if (subtotal) {
      return `Subtotal: ${subtotal[1]}`;
    }

    const shipping = source.match(/^Envío: (.+)$/);
    if (shipping) {
      return `Shipping: ${shipping[1]}`;
    }

    const shippingCost = source.match(/^Costo de envío: (.+)$/);
    if (shippingCost) {
      return `Shipping cost: ${shippingCost[1]}`;
    }

    const discount = source.match(/^Descuento: (.+)$/);
    if (discount) {
      return `Discount: ${discount[1].replace(/envío gratis/i, "free shipping")}`;
    }

    const selectedCoupon = source.match(/^Cupón seleccionado: (.+)$/);
    if (selectedCoupon) {
      return `Selected coupon: ${selectedCoupon[1]}`;
    }

    const estimatedDiscount = source.match(/^Descuento estimado: (.+)$/);
    if (estimatedDiscount) {
      return `Estimated discount: ${estimatedDiscount[1].replace(
        /envío gratis/i,
        "free shipping"
      )}`;
    }

    const total = source.match(/^Total: (.+)$/);
    if (total) {
      return `Total: ${total[1]}`;
    }

    const code = source.match(/^Código: (.+)$/);
    if (code) {
      return `Code: ${code[1]}`;
    }

    const date = source.match(/^Fecha: (.+)$/);
    if (date) {
      return `Date: ${date[1]}`;
    }

    const couponCode = source.match(/^Código de cupón: (.+)$/);
    if (couponCode) {
      return `Coupon code: ${couponCode[1]}`;
    }

    const tracking = source.match(/^Número de seguimiento: (.+)$/);
    if (tracking) {
      return `Tracking number: ${tracking[1]}`;
    }

    const paymentMethod = source.match(/^Método: (.+)$/);
    if (paymentMethod) {
      return `Method: ${paymentMethod[1]}`;
    }

    const paymentMedia = source.match(/^Medio: (.+)$/);
    if (paymentMedia) {
      return `Medium: ${paymentMedia[1]}`;
    }

    const paidTotal = source.match(/^Total pagado: (.+)$/);
    if (paidTotal) {
      return `Total paid: ${paidTotal[1]}`;
    }

    const category = source.match(/^Categoría: (.+)$/);
    if (category) {
      return `Category: ${translateSegment(category[1])}`;
    }

    const search = source.match(/^Búsqueda: (.+)$/);
    if (search) {
      return `Search: ${search[1]}`;
    }

    const sorted = source.match(/^Ordenado: (.+)$/);
    if (sorted) {
      return `Sorted: ${translateSegment(sorted[1])}`;
    }

    const user = source.match(/^Usuario: (.+)$/);
    if (user) {
      return `User: ${user[1]}`;
    }

    const comment = source.match(/^Comentario: (.+)$/);
    if (comment) {
      return `Comment: ${comment[1]}`;
    }

    const address = source.match(/^Dirección: (.+)$/);
    if (address) {
      return `Address: ${address[1]}`;
    }

    const phone = source.match(/^Teléfono: (.+)$/);
    if (phone) {
      return `Phone: ${phone[1]}`;
    }

    const markDefaultAddress = source.match(
      /^Marcar (.+) como dirección predeterminada$/
    );
    if (markDefaultAddress) {
      return `Mark ${markDefaultAddress[1]} as default address`;
    }

    const deleteItem = source.match(/^Eliminar (.+)$/);
    if (deleteItem) {
      return `Delete ${deleteItem[1]}`;
    }

    const editItem = source.match(/^Editar (.+)$/);
    if (editItem) {
      return `Edit ${editItem[1]}`;
    }

    const selectShipping = source.match(/^Seleccionar envío (.+)$/);
    if (selectShipping) {
      return `Select shipping ${selectShipping[1]}`;
    }

    const courierCompany = source.match(/^Empresa a cargo: (.+)$/);
    if (courierCompany) {
      return `Carrier: ${courierCompany[1]}`;
    }

    const shippingEstimate = source.match(
      /^Entrega estimada: (.+), en (.+) días hábiles$/
    );
    if (shippingEstimate) {
      return `Estimated delivery: ${shippingEstimate[1]}, in ${shippingEstimate[2]} business days`;
    }

    const shippingType = source.match(/^Tipo: (.+)$/);
    if (shippingType) {
      return `Type: ${shippingType[1]}`;
    }

    const coordinates = source.match(/^Latitud: (.+), Longitud: (.+)$/);
    if (coordinates) {
      return `Latitude: ${coordinates[1]}, Longitude: ${coordinates[2]}`;
    }

    const view = source.match(/^Ver (.+)$/);
    if (view) {
      return `View ${translateSegment(view[1])}`;
    }

    const open = source.match(/^Abrir (.+)$/);
    if (open) {
      return `Open ${translateSegment(open[1])}`;
    }

    const addToCart = source.match(/^Agregar (.+) al carrito$/);
    if (addToCart) {
      return `Add ${translateSegment(addToCart[1])} to cart`;
    }

    const removeOne = source.match(/^Quitar una unidad de (.+)$/);
    if (removeOne) {
      return `Remove one unit of ${translateSegment(removeOne[1])}`;
    }

    const addOne = source.match(/^Agregar una unidad de (.+)$/);
    if (addOne) {
      return `Add one unit of ${translateSegment(addOne[1])}`;
    }

    const removeFromCart = source.match(/^Quitar (.+) del carrito$/);
    if (removeFromCart) {
      return `Remove ${translateSegment(removeFromCart[1])} from cart`;
    }

    const sortProducts = source.match(/^Ordenar productos en (.+)$/);
    if (sortProducts) {
      return `Sort products in ${translateSegment(sortProducts[1])}`;
    }

    const featuredPosts = source.match(/^Publicaciones destacadas de (.+)$/);
    if (featuredPosts) {
      return `Featured posts from ${translateSegment(featuredPosts[1])}`;
    }

    const allPosts = source.match(/^Todas las publicaciones de (.+)$/);
    if (allPosts) {
      return `All posts from ${translateSegment(allPosts[1])}`;
    }

    const minimum = source.match(/^Mínimo: (.+)$/);
    if (minimum) {
      return `Minimum: ${minimum[1]}`;
    }

    const maximum = source.match(/^Máximo: (.+)$/);
    if (maximum) {
      return `Maximum: ${maximum[1]}`;
    }

    const results = source.match(/^Resultados: (.+)$/);
    if (results) {
      return `Results: ${results[1]}`;
    }

    const addressComponent = source.match(
      /^Error en (.+): "(.+)", corrigelo e intenta nuevamente$/
    );
    if (addressComponent) {
      return `Error in ${addressComponent[1]}: "${addressComponent[2]}", fix it and try again`;
    }

    const addressField = source.match(
      /^Error inesperado en el parametro "(.+)", intenta nuevamente$/
    );
    if (addressField) {
      return `Unexpected error in parameter "${addressField[1]}", please try again`;
    }
  }

  const readMoreAbout = source.match(/^Read more about (.+)$/);
  if (locale === "es" && readMoreAbout) {
    return `Leer más sobre ${translateSegment(readMoreAbout[1])}`;
  }

  const linkedProvider = source.match(/^Provider (.+) already linked$/);
  if (locale === "es" && linkedProvider) {
    return `Proveedor ${linkedProvider[1]} ya vinculado`;
  }

  return undefined;
}

function translateNormalized(source: string, locale: Locale): string {
  const dictionary = locale === "en" ? SPANISH_TO_ENGLISH : ENGLISH_TO_SPANISH;

  return (
    dictionary[source] ??
    findUppercaseMatch(source, dictionary, locale) ??
    translateTemplates(source, locale) ??
    source
  );
}

export function translateText(text: string, locale: Locale) {
  const normalized = normalizeText(text);

  if (!normalized) {
    return text;
  }

  const translated = translateNormalized(normalized, locale);
  return translated === normalized ? text : preserveOuterWhitespace(text, translated);
}

function shouldSkipElement(element: Element) {
  return (
    SKIPPED_TAGS.has(element.tagName) ||
    Boolean(element.closest("[data-i18n-ignore='true']"))
  );
}

function translateTextNode(node: Text, locale: Locale) {
  const current = node.data;

  if (!normalizeText(current)) {
    return;
  }

  const previousSource = textSources.get(node);
  const knownPreviousValues = previousSource
    ? [
        previousSource,
        translateText(previousSource, "es"),
        translateText(previousSource, "en"),
      ]
    : [];
  const shouldRefreshSource =
    !previousSource || !knownPreviousValues.includes(current);
  const source = shouldRefreshSource ? current : previousSource;

  if (shouldRefreshSource) {
    textSources.set(node, source);
  }

  const translated = translateText(source, locale);

  if (current !== translated) {
    node.data = translated;
  }
}

function translateAttributes(element: Element, locale: Locale) {
  let sourceMap = attrSources.get(element);

  TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
    const current = element.getAttribute(attribute);

    if (!current || !normalizeText(current)) {
      return;
    }

    if (!sourceMap) {
      sourceMap = new Map<string, string>();
      attrSources.set(element, sourceMap);
    }

    const previousSource = sourceMap.get(attribute);
    const knownPreviousValues = previousSource
      ? [
          previousSource,
          translateText(previousSource, "es"),
          translateText(previousSource, "en"),
        ]
      : [];
    const shouldRefreshSource =
      !previousSource || !knownPreviousValues.includes(current);
    const source = shouldRefreshSource ? current : previousSource;

    if (shouldRefreshSource) {
      sourceMap?.set(attribute, source);
    }

    const translated = translateText(source, locale);

    if (current !== translated) {
      element.setAttribute(attribute, translated);
    }
  });
}

function applyTranslations(root: ParentNode, locale: Locale) {
  isApplyingTranslations = true;

  try {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const element =
            node.nodeType === Node.ELEMENT_NODE
              ? (node as Element)
              : node.parentElement;

          if (element && shouldSkipElement(element)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    let current: Node | null = walker.currentNode;

    while (current) {
      if (current.nodeType === Node.TEXT_NODE) {
        translateTextNode(current as Text, locale);
      }

      if (current.nodeType === Node.ELEMENT_NODE) {
        translateAttributes(current as Element, locale);
      }

      current = walker.nextNode();
    }
  } finally {
    isApplyingTranslations = false;
  }
}

function updateMeta(selector: string, content: string) {
  const meta = document.head.querySelector<HTMLMetaElement>(selector);

  if (meta) {
    meta.content = content;
  }
}

function updateRuntimeMetadata(locale: Locale) {
  const metadata = LOCALE_DETAILS[locale].metadata;

  document.title = metadata.title;
  updateMeta("meta[name='description']", metadata.description);
  updateMeta("meta[property='og:title']", metadata.title);
  updateMeta("meta[property='og:description']", metadata.description);
  updateMeta("meta[property='og:locale']", metadata.openGraphLocale);
  updateMeta("meta[name='twitter:title']", metadata.title);
  updateMeta("meta[name='twitter:description']", metadata.description);
}

function readStoredLocale() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : null;
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(
    normalizeLocale(initialLocale)
  );

  useEffect(() => {
    const storedLocale = readStoredLocale();

    if (storedLocale) {
      setLocaleState(storedLocale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = LOCALE_DETAILS[locale].htmlLang;
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    updateRuntimeMetadata(locale);
  }, [locale]);

  useEffect(() => {
    let animationFrame: number | null = null;

    const scheduleApply = () => {
      if (animationFrame !== null || isApplyingTranslations || !document.body) {
        return;
      }

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        applyTranslations(document.body, locale);
      });
    };

    scheduleApply();

    const observer = new MutationObserver(() => {
      scheduleApply();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(normalizeLocale(nextLocale));
  }, []);

  const value = useMemo<I18nContextType>(
    () => ({
      locale,
      setLocale,
      t: (text: string) => translateText(text, locale),
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside an I18nProvider");
  }

  return context;
}
