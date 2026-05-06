import React from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Motion button with Framer Motion animations
const MotionButton = motion("button");

export function SecondaryButton({
  children,
  icon: Icon,
  loading = false,
  className = "",
  ...props
}) {
  return (
    <MotionButton
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-6 text-sm font-semibold text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-700 hover:text-white hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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