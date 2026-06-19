"use client";

import { useCallback, useEffect, useRef } from "react";

type RevealCallback = (entry: IntersectionObserverEntry) => void;

const callbacks = new WeakMap<Element, RevealCallback>();
let sharedObserver: IntersectionObserver | null = null;
const DEFAULT_MOBILE_REVEAL_QUERY = "(max-width: 767px)";

function getSharedObserver() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => callbacks.get(entry.target)?.(entry));
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12,
      }
    );
  }

  return sharedObserver;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    "matchMedia" in window &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getMobileRevealQuery(enabled: boolean, query: string) {
  if (
    !enabled ||
    typeof window === "undefined" ||
    !("matchMedia" in window)
  ) {
    return null;
  }

  return window.matchMedia(query);
}

export function useViewportReveal({
  once = true,
  visibleClassName = "is-visible",
  revealOnMobile = false,
  mobileQuery = DEFAULT_MOBILE_REVEAL_QUERY,
}: {
  once?: boolean;
  visibleClassName?: string;
  revealOnMobile?: boolean;
  mobileQuery?: string;
} = {}) {
  const cleanupRef = useRef<() => void>();
  const revealedRef = useRef(false);

  const setRevealRef = useCallback(
    (node: HTMLElement | null) => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;

      if (!node) {
        return;
      }

      let observer: IntersectionObserver | null = null;
      let removeMobileRevealListener: (() => void) | undefined;
      const mobileRevealQuery = getMobileRevealQuery(
        revealOnMobile,
        mobileQuery
      );
      const revealNode = () => {
        node.classList.add(visibleClassName);
        revealedRef.current = true;
        observer?.unobserve(node);
        callbacks.delete(node);
        removeMobileRevealListener?.();
        removeMobileRevealListener = undefined;
      };

      if (mobileRevealQuery?.matches) {
        revealNode();
        return;
      }

      if (
        revealedRef.current ||
        prefersReducedMotion() ||
        typeof window === "undefined" ||
        !("IntersectionObserver" in window)
      ) {
        revealNode();
        return;
      }

      node.classList.remove(visibleClassName);

      observer = getSharedObserver();
      if (!observer) {
        revealNode();
        return;
      }

      const handleMobileReveal = (event: MediaQueryListEvent) => {
        if (event.matches) {
          revealNode();
        }
      };

      if (mobileRevealQuery) {
        mobileRevealQuery.addEventListener("change", handleMobileReveal);
        removeMobileRevealListener = () =>
          mobileRevealQuery.removeEventListener("change", handleMobileReveal);
      }

      callbacks.set(node, (entry) => {
        if (!entry.isIntersecting && entry.intersectionRatio <= 0) {
          if (!once) {
            node.classList.remove(visibleClassName);
          }
          return;
        }

        node.classList.add(visibleClassName);
        revealedRef.current = true;

        if (once) {
          observer?.unobserve(node);
          callbacks.delete(node);
          removeMobileRevealListener?.();
          cleanupRef.current = undefined;
        }
      });

      observer.observe(node);
      cleanupRef.current = () => {
        observer?.unobserve(node);
        callbacks.delete(node);
        removeMobileRevealListener?.();
      };
    },
    [mobileQuery, once, revealOnMobile, visibleClassName]
  );

  useEffect(() => {
    return () => cleanupRef.current?.();
  }, []);

  return setRevealRef;
}
