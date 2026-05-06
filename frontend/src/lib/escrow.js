export const statusLabels = ["Funded", "Released", "Cancel Requested", "Refunded"];
export const statusStyles = [
  "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  "border-sky-500/30 bg-sky-500/10 text-sky-200",
  "border-amber-500/30 bg-amber-500/10 text-amber-200",
  "border-zinc-500/30 bg-zinc-500/10 text-zinc-200",
];

export function normalizeDeal(id, data) {
  return {
    id,
    buyer: data.buyer,
    seller: data.seller,
    amountLamports: Number(data.amountLamports ?? data.amount ?? 0),
    description: data.description,
    status: Number(data.status),
    createdAt: data.createdAt,
    completedAt: data.completedAt,
  };
}

export function lamportsToSol(lamports) {
  return Number(lamports || 0) / 1_000_000_000;
}

export function getAdminStats(deals) {
  return deals.reduce(
    (stats, deal) => {
      stats.total += 1;
      stats.volume += lamportsToSol(deal.amountLamports);
      if (deal.status === 0) stats.funded += 1;
      if (deal.status === 1) stats.released += 1;
      if (deal.status === 2) stats.cancelRequested += 1;
      if (deal.status === 3) stats.refunded += 1;
      return stats;
    },
    { total: 0, volume: 0, funded: 0, released: 0, cancelRequested: 0, refunded: 0 },
  );
}

