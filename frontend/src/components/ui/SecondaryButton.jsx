import React from "react";
import { Loader2 } from "lucide-react";

export function SecondaryButton({ children, icon: Icon, loading, className = "", ...props }) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-4 text-sm font-semibold text-zinc-100 transition hover:border-ember-700 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

