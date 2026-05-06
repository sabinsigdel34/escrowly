import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const baseStyles =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variantStyles = {
  default:
    "border border-transparent bg-[#c45d33] text-white hover:bg-[#d66f45] shadow-[0_14px_35px_rgba(196,93,51,0.35)]",
  secondary:
    "border border-[rgba(106,114,83,0.45)] bg-[rgba(106,114,83,0.14)] text-white hover:bg-[rgba(106,114,83,0.24)]",
  ghost: "text-zinc-200 hover:bg-white/10 hover:text-white",
};

const sizeStyles = {
  default: "h-11 px-5 py-2",
  lg: "h-12 px-7",
  sm: "h-9 px-4 text-xs",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef(function Button(
  { className, variant = "default", size = "default", asChild = false, reduceMotion = false, children, ...props },
  ref,
) {
  const classNames = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(classNames, children.props.className),
      ref,
      ...props,
    });
  }

  const Comp = motion.button;
  return (
    <Comp
      className={classNames}
      ref={ref}
      whileHover={reduceMotion ? undefined : { y: -2, scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={reduceMotion ? undefined : { type: "spring", stiffness: 320, damping: 18 }}
      {...props}
    >
      {children}
    </Comp>
  );
});
