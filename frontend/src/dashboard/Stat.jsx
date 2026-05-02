import React from "react";

export function Stat({ label, value }) {
  return (
    <div className="rounded-md border border-zinc-900 bg-zinc-950/70 p-4">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-2 truncate text-lg font-bold">{value}</p>
    </div>
  );
}

