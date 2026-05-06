import React from "react";
import { motion } from "framer-motion";

// Motion button with Framer Motion animations
const MotionButton = motion("button");

export function IconButton({
  children,
  onClick,
  label = "",
  variant = "ghost",
  size = "default",
  className = "",
  disabled = false,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary: "bg-ember-600 text-white shadow-lg shadow-ember-600/30 hover:bg-ember-500 hover:shadow-ember-600/50",
    secondary: "bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50",
    outline: "bg-transparent text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-white",
  };

  const sizes = {
    sm: "h-8 w-8 rounded-md",
    default: "h-10 w-10 rounded-lg",
    lg: "h-12 w-12 rounded-xl",
  };

  return (
    <MotionButton
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </MotionButton>
  );
}