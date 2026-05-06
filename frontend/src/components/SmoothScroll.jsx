import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Custom hook to check for reduced motion preference
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

export function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Skip Lenis initialization if user prefers reduced motion
    if (prefersReducedMotion) {
      document.documentElement.style.scrollBehavior = "smooth";
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
      // Performance optimizations
      touchInertiaMultiplier: 35,
      overwrite: true,
      lerp: 0.1,
      // Prevent scrolling on specific elements
      prevent: (node) => {
        // Allow scrolling on elements with data-lenis-prevent
        if (node.hasAttribute?.("data-lenis-prevent")) {
          return true;
        }
        return false;
      },
    });

    lenisRef.current = lenis;

    // Integrate with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    const ticker = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);

    gsap.ticker.lagSmoothing(0);

    // Add lenis instance to window for debugging
    window.lenis = lenis;

    // Cleanup
    return () => {
      lenis.destroy();
      gsap.ticker.remove(ticker);
      delete window.lenis;
    };
  }, [prefersReducedMotion]);

  // Expose scrollTo method for programmatic scrolling
  useEffect(() => {
    if (lenisRef.current) {
      window.scrollToSmooth = (target, options = {}) => {
        lenisRef.current?.scrollTo(target, {
          offset: options.offset || 0,
          immediate: options.immediate || false,
          duration: options.duration || 1.5,
          easing: options.easing || ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
        });
      };
    }

    return () => {
      delete window.scrollToSmooth;
    };
  }, []);

  return <>{children}</>;
}

// Hook to access Lenis instance
export function useLenis() {
  return typeof window !== "undefined" ? window.lenis : null;
}

// Component for preventing Lenis on specific elements
export function LenisPrevent({ children }) {
  return (
    <div data-lenis-prevent>
      {children}
    </div>
  );
}