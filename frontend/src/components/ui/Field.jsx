import React from "react";

export function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

