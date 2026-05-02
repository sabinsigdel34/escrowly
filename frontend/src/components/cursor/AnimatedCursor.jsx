import React, { useEffect, useRef } from "react";
import gsap from "gsap";

function isCoarsePointer() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function AnimatedCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (isCoarsePointer() || prefersReducedMotion()) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { x: pos.x, y: pos.y };

    const dotX = gsap.quickTo(dot, "x", { duration: 0.18, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.18, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3.out" });

    const move = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      dotX(target.x);
      dotY(target.y);
      ringX(target.x);
      ringY(target.y);
    };

    const down = () => {
      gsap.to(ring, { scale: 0.78, duration: 0.15, ease: "power2.out" });
      gsap.to(dot, { scale: 1.5, duration: 0.15, ease: "power2.out" });
    };

    const up = () => {
      gsap.to(ring, { scale: 1, duration: 0.25, ease: "power3.out" });
      gsap.to(dot, { scale: 1, duration: 0.25, ease: "power3.out" });
    };

    const enterInteractive = () => {
      document.documentElement.dataset.cursor = "hover";
      gsap.to(ring, { scale: 1.45, duration: 0.25, ease: "power3.out" });
      gsap.to(dot, { opacity: 0.0, duration: 0.2, ease: "power2.out" });
    };

    const leaveInteractive = () => {
      document.documentElement.dataset.cursor = "default";
      gsap.to(ring, { scale: 1, duration: 0.25, ease: "power3.out" });
      gsap.to(dot, { opacity: 1, duration: 0.2, ease: "power2.out" });
    };

    const onPointerOver = (e) => {
      const el = e.target?.closest?.('a, button, [role="button"], input, textarea, select, [data-cursor="hover"]');
      if (el) enterInteractive();
    };
    const onPointerOut = (e) => {
      const el = e.target?.closest?.('a, button, [role="button"], input, textarea, select, [data-cursor="hover"]');
      if (el) leaveInteractive();
    };

    const setVisible = () => {
      document.documentElement.dataset.cursorVisible = "true";
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointermove", setVisible, { once: true, passive: true });
    window.addEventListener("pointerover", onPointerOver, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });

    // Place at origin using translate(-50%, -50%) in CSS
    gsap.set([dot, ring], { x: pos.x, y: pos.y });
    document.documentElement.dataset.cursor = "default";

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener("pointerout", onPointerOut);
    };
  }, []);

  return (
    <div className="es-cursor" aria-hidden="true">
      <div ref={ringRef} className="es-cursor-ring" />
      <div ref={dotRef} className="es-cursor-dot" />
    </div>
  );
}

