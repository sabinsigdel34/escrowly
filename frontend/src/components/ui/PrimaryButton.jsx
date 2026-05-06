import React from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Motion button with Framer Motion animations
const MotionButton = motion("button");

export function PrimaryButton({
  children,
  icon: Icon,
  loading = false,
  className = "",
  variant = "primary",
  size = "default",
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary: "bg-ember-600 text-white shadow-lg shadow-ember-600/30 hover:bg-ember-500 hover:shadow-ember-600/50 hover:-translate-y-0.5",
    secondary: "bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 hover:-translate-y-0.5",
    outline: "bg-transparent text-ember-500 border-2 border-ember-500 hover:bg-ember-500 hover:text-white hover:-translate-y-0.5",
    ghost: "bg-transparent text-zinc-300 hover:text-white hover:bg-zinc-800/50",
    destructive: "bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-500 hover:shadow-red-600/50 hover:-translate-y-0.5",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm rounded-md",
    default: "h-11 px-6 text-sm rounded-lg",
    lg: "h-14 px-8 text-base rounded-xl",
    icon: "h-11 w-11 rounded-lg",
  };

  return (
    <MotionButton
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </MotionButton>
  );
}