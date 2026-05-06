import React, { useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export const HeroScene = React.memo(function HeroScene() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const yDrift = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -36]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.8], [0.55, 0.28]);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });

  const onPointerMove = (event) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPointer({ x, y });
  };

  return (
    <motion.div
      className="es-hero-scene"
      aria-hidden="true"
      onPointerMove={onPointerMove}
      style={{
        y: yDrift,
        background:
          "radial-gradient(circle at 24% 26%, rgba(196, 93, 51, 0.2), transparent 54%), radial-gradient(circle at 76% 74%, rgba(106, 114, 83, 0.18), transparent 56%)",
      }}
    >
      <motion.div
        className="es-hero-ambient-glow"
        style={{
          opacity: glowOpacity,
          background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(196,93,51,0.28), transparent 38%)`,
        }}
      />
      <motion.div
        className="es-hero-orb es-hero-orb-primary"
        animate={reduceMotion ? undefined : { y: [0, -16, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="es-hero-orb es-hero-orb-secondary"
        animate={reduceMotion ? undefined : { y: [0, 14, 0], x: [0, -8, 0] }}
        transition={{ duration: 9.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
      <div className="es-hero-noise-overlay" />
    </motion.div>
  );
});

export default HeroScene;

