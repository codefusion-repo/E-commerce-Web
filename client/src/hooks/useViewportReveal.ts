"use client";

import { useCallback, useEffect, useRef } from "react";

type RevealCallback = (entry: IntersectionObserverEntry) => void;

const DEFAULT_ROOT_MARGIN = "0px 0px -8% 0px";
const DEFAULT_THRESHOLD = 0.12;

const callbacks = new WeakMap<Element, RevealCallback>();
const sharedObservers = new Map<string, IntersectionObserver>();

// Registry of nodes still waiting to be revealed (observer attached, not yet
// intersected). A single resize/orientationchange listener reconciles them so a
// breakpoint change (mobile <-> desktop) can never leave a card that is already
// on screen stuck hidden when the observer does not re-fire.
const pendingReveals = new Map<Element, () => void>();
let reconcileScheduled = false;

function isInViewport(node: Element) {
  if (typeof window === "undefined") {
    return false;
  }
  const rect = node.getBoundingClientRect();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  return rect.top < viewportHeight && rect.bottom > 0;
}

function reconcilePendingReveals() {
  reconcileScheduled = false;
  pendingReveals.forEach((reveal, node) => {
    if (isInViewport(node)) {
      reveal();
    }
  });
}

function scheduleReconcile() {
  if (reconcileScheduled || typeof window === "undefined") {
    return;
  }
  reconcileScheduled = true;
  // Defer to the next frame so reconciliation runs after React has finished any
  // re-render triggered by the same resize (e.g. a breakpoint className swap).
  window.requestAnimationFrame(reconcilePendingReveals);
}

let reconcileListening = false;
function ensureReconcileListener() {
  if (reconcileListening || typeof window === "undefined") {
    return;
  }
  reconcileListening = true;
  window.addEventListener("resize", scheduleReconcile);
  window.addEventListener("orientationchange", scheduleReconcile);
}

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
  onReveal,
}: {
  once?: boolean;
  visibleClassName?: string;
  rootMargin?: string;
  threshold?: number;
  // Notified whenever the node is revealed. Components with a dynamic React
  // `className` should use this to render the visible class via state, so React
  // re-renders never strip the imperatively-added class and hide the element.
  onReveal?: () => void;
} = {}) {
  const cleanupRef = useRef<() => void>();
  const revealedRef = useRef(false);
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

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
        onRevealRef.current?.();
        // For one-shot reveals stop watching the node; for repeatable reveals
        // keep the observer so it can hide the node again when it leaves.
        if (once) {
          observer?.unobserve(node);
          callbacks.delete(node);
          pendingReveals.delete(node);
        }
      };

      // Fail-open: when JS short-circuits, the observer is unavailable, or the
      // user prefers reduced motion, reveal immediately. Never leave a node
      // hidden because the observer could not run.
      if (
        revealedRef.current ||
        prefersReducedMotion() ||
        typeof window === "undefined" ||
        !("IntersectionObserver" in window)
      ) {
        revealNode();
        return;
      }

      observer = getSharedObserver(rootMargin, threshold);
      if (!observer) {
        revealNode();
        return;
      }

      node.classList.remove(visibleClassName);

      callbacks.set(node, (entry) => {
        if (!entry.isIntersecting && entry.intersectionRatio <= 0) {
          if (!once) {
            node.classList.remove(visibleClassName);
            revealedRef.current = false;
          }
          return;
        }

        revealNode();
      });

      observer.observe(node);
      // Track as pending so the resize/orientationchange reconciler can reveal
      // it if a breakpoint change brings it on screen without the observer
      // re-firing.
      pendingReveals.set(node, revealNode);
      ensureReconcileListener();

      cleanupRef.current = () => {
        observer?.unobserve(node);
        callbacks.delete(node);
        pendingReveals.delete(node);
      };
    },
    [once, visibleClassName, rootMargin, threshold]
  );

  useEffect(() => {
    return () => cleanupRef.current?.();
  }, []);

  return setRevealRef;
}
