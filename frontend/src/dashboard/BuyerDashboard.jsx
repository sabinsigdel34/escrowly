import React from "react";
import { CircleDollarSign, BadgeCheck, RefreshCw, ArrowRight } from "lucide-react";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { Field } from "../components/ui/Field";
import { Stat } from "./Stat";
import { DealDetail } from "./DealDetail";
import { shortAddress } from "../lib/format";

export function BuyerDashboard(props) {
  const {
    account,
    busy,
    cancelRequested,
    chainId,
    contractAddress,
    copyAddress,
    createDeal,
    deal,
    dealId,
    description,
    funded,
    isBuyer,
    isSeller,
    loadDeal,
    amount,
    runDealAction,
    seller,
    setAmount,
    setDealId,
    setDescription,
    setSeller,
  } = props;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-md border border-zinc-800 bg-zinc-950/80 p-5 shadow-redline">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Create Deal</h2>
              <p className="text-sm text-zinc-500">Buyer deposits funds into the escrow contract.</p>
            </div>
            <CircleDollarSign className="h-6 w-6 text-ember-500" />
          </div>

          <form className="grid gap-4" onSubmit={createDeal}>
            <Field label="Seller Address">
              <input
                className="h-11 rounded-md border border-zinc-800 bg-black px-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-ember-600"
                placeholder="Solana wallet (base58)"
                value={seller}
                onChange={(event) => setSeller(event.target.value)}
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-[0.5fr_1fr]">
              <Field label="Amount">
                <div className="flex h-11 overflow-hidden rounded-md border border-zinc-800 bg-black focus-within:border-ember-600">
                  <input
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    required
                  />
                  <span className="grid place-items-center border-l border-zinc-800 px-3 text-xs font-bold text-zinc-500">SOL</span>
                </div>
              </Field>

              <Field label="Description">
                <input
                  className="h-11 rounded-md border border-zinc-800 bg-black px-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-ember-600"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                />
              </Field>
            </div>

            <PrimaryButton icon={ArrowRight} loading={busy === "create"} disabled={!account || !contractAddress}>
              Create Escrow
            </PrimaryButton>
          </form>
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-950/80 p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Deal Desk</h2>
              <p className="text-sm text-zinc-500">Load a deal and settle it from the connected wallet.</p>
            </div>
            <BadgeCheck className="h-6 w-6 text-ember-500" />
          </div>

          <div className="flex gap-3">
            <input
              className="h-11 min-w-0 flex-1 rounded-md border border-zinc-800 bg-black px-3 text-sm outline-none transition focus:border-ember-600"
              value={dealId}
              onChange={(event) => setDealId(event.target.value)}
            />
            <SecondaryButton icon={RefreshCw} loading={busy === "load"} onClick={() => loadDeal()}>
              Load
            </SecondaryButton>
          </div>

          <DealDetail
            busy={busy}
            cancelRequested={cancelRequested}
            copyAddress={copyAddress}
            deal={deal}
            funded={funded}
            isBuyer={isBuyer}
            isSeller={isSeller}
            runDealAction={runDealAction}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Program" value={contractAddress ? shortAddress(contractAddress) : "API mode"} />
        <Stat label="Network" value={chainId || "Disconnected"} />
        <Stat label="Wallet" value={account ? "Connected" : "Locked"} />
      </section>
    </>
  );
}

