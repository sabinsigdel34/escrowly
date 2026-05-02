import React, { useEffect } from "react";

export function Toast({ kind = "success", message, onClear }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = window.setTimeout(() => onClear?.(), 4500);
    return () => window.clearTimeout(t);
  }, [message, onClear]);

  if (!message) return null;

  const classes =
    kind === "error"
      ? "border-ember-700 bg-ember-950 text-ember-100"
      : "border-emerald-800 bg-emerald-950 text-emerald-100";

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 rounded-md border px-4 py-3 text-sm shadow-redline md:left-auto md:w-[460px] ${classes}`}>
      {message}
    </div>
  );
}

