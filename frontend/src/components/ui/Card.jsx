import React from "react";
import { motion } from "framer-motion";

// Motion div for animated cards
const MotionDiv = motion("div");

export function Card({
  children,
  className = "",
  hover = true,
  initial = { opacity: 0, y: 20 },
  whileInView = { opacity: 1, y: 0 },
  viewport = { once: true, margin: "-50px" },
  transition = { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  ...props
}) {
  return (
    <MotionDiv
      className={`rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 transition-colors duration-300 hover:border-zinc-700 hover:bg-zinc-800/50 ${className}`}
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
      whileHover={
        hover
          ? {
              scale: 1.02,
              y: -4,
              transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
            }
          : undefined
      }
      {...props}
    >
      {children}
    </MotionDiv>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", as: Component = "h3", ...props }) {
  return (
    <Component
      className={`text-lg font-semibold text-white ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p
      className={`text-sm text-zinc-400 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div
      className={`mt-4 flex items-center ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}