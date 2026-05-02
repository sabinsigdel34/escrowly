import React from "react";
import { ethers } from "ethers";
import { Ban, Check, X } from "lucide-react";
import { formatDate } from "../lib/format";
import { statusLabels, statusStyles } from "../lib/escrow";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { DealRow } from "./DealRow";

export function DealDetail({ busy, cancelRequested, copyAddress, deal, funded, isBuyer, isSeller, runDealAction }) {
  if (!deal) {
    return (
      <div className="mt-5 grid min-h-60 place-items-center rounded-md border border-dashed border-zinc-800 bg-black/50 text-sm text-zinc-500">
        No deal loaded
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-4">
      <div className={`w-fit rounded-md border px-3 py-1 text-xs font-bold ${statusStyles[deal.status]}`}>
        {statusLabels[deal.status]}
      </div>

      <div className="grid gap-3 text-sm">
        <DealRow label="Buyer" value={deal.buyer} onCopy={() => copyAddress(deal.buyer)} />
        <DealRow label="Seller" value={deal.seller} onCopy={() => copyAddress(deal.seller)} />
        <DealRow label="Amount" value={`${ethers.formatEther(deal.amount)} ETH`} />
        <DealRow label="Created" value={formatDate(deal.createdAt)} />
        <DealRow label="Completed" value={formatDate(deal.completedAt)} />
      </div>

      <div className="rounded-md border border-zinc-800 bg-black p-3 text-sm text-zinc-300">{deal.description}</div>

      <div className="grid gap-3 sm:grid-cols-3">
        <PrimaryButton
          icon={Check}
          loading={busy === "releasePayment"}
          disabled={!isBuyer || !funded}
          onClick={() => runDealAction("releasePayment", `Deal #${deal.id} released.`)}
        >
          Release
        </PrimaryButton>
        <SecondaryButton
          icon={Ban}
          loading={busy === "requestCancellation"}
          disabled={!isSeller || !funded}
          onClick={() => runDealAction("requestCancellation", `Cancellation requested for deal #${deal.id}.`)}
        >
          Cancel
        </SecondaryButton>
        <SecondaryButton
          icon={X}
          loading={busy === "approveRefund"}
          disabled={!isBuyer || !cancelRequested}
          onClick={() => runDealAction("approveRefund", `Deal #${deal.id} refunded.`)}
        >
          Refund
        </SecondaryButton>
      </div>
    </div>
  );
}

