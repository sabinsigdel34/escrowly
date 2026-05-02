import React from "react";
import { BarChart3, ChevronRight, RefreshCw, Users } from "lucide-react";
import { ethers } from "ethers";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { Stat } from "./Stat";
import { formatDate, shortAddress } from "../lib/format";
import { statusLabels, statusStyles } from "../lib/escrow";

export function AdminDashboard({ adminDeals, adminLoadedAt, adminStats, busy, contractAddress, loadAdminDeals, setDealId, setView }) {
  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 rounded-md border border-zinc-800 bg-zinc-950/80 p-5 shadow-redline lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
          <p className="mt-1 text-sm text-zinc-500">Monitor all contract deals, settlement status, parties, and total locked value.</p>
        </div>
        <SecondaryButton icon={RefreshCw} loading={busy === "admin"} disabled={!contractAddress} onClick={loadAdminDeals}>
          Refresh Deals
        </SecondaryButton>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="All Deals" value={adminStats.total.toString()} />
        <Stat label="Volume" value={`${adminStats.volume.toFixed(4)} ETH`} />
        <Stat label="Funded" value={adminStats.funded.toString()} />
        <Stat label="Released" value={adminStats.released.toString()} />
      </div>

      <div className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-950/80">
        <div className="flex flex-col gap-2 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-ember-500" />
            <h3 className="font-semibold text-white">Deal Ledger</h3>
          </div>
          <p className="text-sm text-zinc-500">{adminLoadedAt ? `Updated ${adminLoadedAt}` : "Not loaded yet"}</p>
        </div>

        {adminDeals.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-black text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {adminDeals.map((row) => (
                  <tr key={row.id} className="transition hover:bg-black/45">
                    <td className="px-4 py-3 font-bold text-white">#{row.id}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md border px-2 py-1 text-xs font-bold ${statusStyles[row.status]}`}>
                        {statusLabels[row.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-100">{ethers.formatEther(row.amount)} ETH</td>
                    <td className="px-4 py-3 text-zinc-400">{shortAddress(row.buyer)}</td>
                    <td className="px-4 py-3 text-zinc-400">{shortAddress(row.seller)}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-zinc-300">{row.description}</td>
                    <td className="px-4 py-3 text-zinc-500">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-800 bg-black px-3 font-semibold text-zinc-100 transition hover:border-ember-700"
                        onClick={() => {
                          setDealId(row.id);
                          setView("buyer");
                        }}
                        data-cursor="hover"
                      >
                        Open
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center gap-3 p-6 text-center">
            <Users className="h-9 w-9 text-zinc-700" />
            <p className="text-sm text-zinc-500">Refresh the ledger to load contract deals.</p>
          </div>
        )}
      </div>
    </section>
  );
}

