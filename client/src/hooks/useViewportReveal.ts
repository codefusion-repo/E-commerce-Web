"use client";

import { useCallback, useEffect, useRef } from "react";

type RevealCallback = (entry: IntersectionObserverEntry) => void;

const DEFAULT_ROOT_MARGIN = "0px 0px -8% 0px";
const DEFAULT_THRESHOLD = 0.12;

const callbacks = new WeakMap<Element, RevealCallback>();
const sharedObservers = new Map<string, IntersectionObserver>();

function getSharedObserver(rootMargin: string, threshold: number) {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  const key = `${rootMargin}|${threshold}`;
  let observer = sharedObservers.get(key);
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => callbacks.get(entry.target)?.(entry));
      },
      { rootMargin, threshold }
    );
    sharedObservers.set(key, observer);
  }

  return observer;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    "matchMedia" in window &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function useViewportReveal({
  once = true,
  visibleClassName = "is-visible",
  rootMargin = DEFAULT_ROOT_MARGIN,
  threshold = DEFAULT_THRESHOLD,
}: {
  once?: boolean;
  visibleClassName?: string;
  rootMargin?: string;
  threshold?: number;
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
      const revealNode = () => {
        node.classList.add(visibleClassName);
        revealedRef.current = true;
        observer?.unobserve(node);
        callbacks.delete(node);
      };

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

      observer = getSharedObserver(rootMargin, threshold);
      if (!observer) {
        revealNode();
        return;
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
          cleanupRef.current = undefined;
        }
      });

      observer.observe(node);
      cleanupRef.current = () => {
        observer?.unobserve(node);
        callbacks.delete(node);
      };
    },
    [once, visibleClassName, rootMargin, threshold]
  );

  useEffect(() => {
    return () => cleanupRef.current?.();
  }, []);

  return setRevealRef;
}
