import React, { useEffect, useRef } from "react";
import gsap from "gsap";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function FloatingAccent({ className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (prefersReduced) return undefined;

    const floatTween = gsap.to(el, {
      y: "+=14",
      x: "+=10",
      rotate: 0.6,
      duration: 4.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    let dragging = false;
    let start = { x: 0, y: 0 };
    let startPos = { x: 0, y: 0 };

    const onDown = (e) => {
      dragging = true;
      floatTween.pause();
      el.setPointerCapture?.(e.pointerId);
      start = { x: e.clientX, y: e.clientY };
      const tr = gsap.getProperty(el, "translateX");
      const ty = gsap.getProperty(el, "translateY");
      startPos = { x: Number(tr) || 0, y: Number(ty) || 0 };
      gsap.to(el, { scale: 1.04, duration: 0.15, ease: "power2.out" });
    };

    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;

      const nx = clamp(startPos.x + dx, -120, 120);
      const ny = clamp(startPos.y + dy, -90, 90);
      gsap.set(el, { translateX: nx, translateY: ny });
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      gsap.to(el, { scale: 1, duration: 0.2, ease: "power3.out" });
      floatTween.resume();
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      floatTween.kill();
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`es-floating-accent ${className}`}
      role="presentation"
      aria-hidden="true"
      data-cursor="hover"
      title="Drag me"
    />
  );
}

