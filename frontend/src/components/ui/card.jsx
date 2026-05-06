import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const Card = React.forwardRef(function Card(
  { className, reduceMotion = false, ...props },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-xl border border-[rgba(196,93,51,0.2)] bg-[rgba(10,10,12,0.65)] p-6 backdrop-blur-md",
        className,
      )}
      whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
      transition={reduceMotion ? undefined : { duration: 0.25, ease: "easeOut" }}
      {...props}
    />
  );
});

export function CardHeader({ className, ...props }) {
  return <div className={cn("space-y-1.5", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-2xl uppercase tracking-wide text-white", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm leading-6 text-zinc-300", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("", className)} {...props} />;
}
