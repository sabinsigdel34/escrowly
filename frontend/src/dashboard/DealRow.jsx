import React from "react";
import { Copy } from "lucide-react";

export function DealRow({ label, value, onCopy }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-zinc-900 bg-black px-3">
      <span className="text-zinc-500">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-medium">{value}</span>
        {onCopy ? (
          <button
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
            onClick={onCopy}
            title="Copy address"
            data-cursor="hover"
          >
            <Copy className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

