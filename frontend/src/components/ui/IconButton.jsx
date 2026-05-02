import React from "react";

export function IconButton({ children, label, className = "", ...props }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`flex h-11 w-11 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-zinc-400 transition hover:border-ember-700 hover:bg-zinc-900 hover:text-white ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

