import React, { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { Shield, Wallet, X } from "lucide-react";
import { simpleEscrowAbi } from "../contracts/simpleEscrowAbi";
import { AnimatedCursor } from "../components/cursor/AnimatedCursor";
import { AppShell } from "../components/layout/AppShell";
import { LandingPage } from "../landing/LandingPage";
import { AdminDashboard } from "../dashboard/AdminDashboard";
import { BuyerDashboard } from "../dashboard/BuyerDashboard";
import { IconButton } from "../components/ui/IconButton";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { Toast } from "../components/ui/Toast";
import { getErrorMessage, sameAddress, shortAddress } from "../lib/format";
import { getAdminStats, normalizeDeal } from "../lib/escrow";

const contractAddress = import.meta.env.VITE_ESCROW_ADDRESS || "";

const navItems = [
  { id: "landing", label: "Service" },
  { id: "buyer", label: "Buyer Dashboard" },
  { id: "admin", label: "Admin" },
];

export function App() {
  const [view, setView] = useState("landing");
  const [theme, setTheme] = useState(() => localStorage.getItem("escrowly-theme") || "dark");
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [balance, setBalance] = useState("");
  const [dealId, setDealId] = useState("1");
  const [deal, setDeal] = useState(null);
  const [adminDeals, setAdminDeals] = useState([]);
  const [adminLoadedAt, setAdminLoadedAt] = useState("");
  const [seller, setSeller] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [description, setDescription] = useState("Website escrow");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const hasWallet = typeof window !== "undefined" && Boolean(window.ethereum);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("escrowly-theme", next);
  };

  const provider = useMemo(() => {
    if (!hasWallet) return null;
    return new ethers.BrowserProvider(window.ethereum);
  }, [hasWallet]);

  const signerContract = async () => {
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, simpleEscrowAbi, signer);
  };

  const readContract = () => new ethers.Contract(contractAddress, simpleEscrowAbi, provider);

  async function refreshWallet() {
    if (!provider) return;
    const accounts = await provider.send("eth_accounts", []);
    const network = await provider.getNetwork();
    setChainId(network.chainId.toString());

    if (accounts[0]) {
      setAccount(accounts[0]);
      const walletBalance = await provider.getBalance(accounts[0]);
      setBalance(Number(ethers.formatEther(walletBalance)).toFixed(4));
      return;
    }

    setAccount("");
    setBalance("");
  }

  async function connectWallet() {
    setError("");
    if (!provider) {
      setError("MetaMask is not available in this browser.");
      return;
    }
    await provider.send("eth_requestAccounts", []);
    await refreshWallet();
  }

  async function disconnectWallet() {
    setError("");
    setNotice("");

    try {
      if (window.ethereum?.request) {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      }
    } catch {
      // Permission revocation not supported in all wallets.
    }

    setAccount("");
    setBalance("");
    setChainId("");
    setDeal(null);
    setNotice("Wallet disconnected. Connect again and choose another account.");
  }

  async function loadDeal(id = dealId) {
    setError("");
    setNotice("");
    if (!contractAddress) {
      setError("Set VITE_ESCROW_ADDRESS in frontend/.env.");
      return;
    }
    if (!provider) {
      setError("Connect a wallet provider first.");
      return;
    }
    if (!id || Number(id) <= 0) {
      setError("Enter a valid deal ID.");
      return;
    }

    try {
      setBusy("load");
      const contract = readContract();
      const data = await contract.getDeal(id);
      setDeal(normalizeDeal(id, data));
    } catch (err) {
      setDeal(null);
      setError(getErrorMessage(err));
    } finally {
      setBusy("");
    }
  }

  async function loadAdminDeals() {
    setError("");
    setNotice("");
    if (!contractAddress) {
      setError("Set VITE_ESCROW_ADDRESS in frontend/.env.");
      return;
    }
    if (!provider) {
      setError("Connect a wallet provider first.");
      return;
    }

    try {
      setBusy("admin");
      const contract = readContract();
      const nextDealId = Number(await contract.nextDealId());
      const ids = Array.from({ length: Math.max(nextDealId - 1, 0) }, (_, index) => index + 1);
      const rows = await Promise.all(
        ids.map(async (id) => {
          const data = await contract.getDeal(id);
          return normalizeDeal(id.toString(), data);
        }),
      );
      setAdminDeals(rows.reverse());
      setAdminLoadedAt(new Date().toLocaleTimeString());
      setNotice(`Loaded ${rows.length} deal${rows.length === 1 ? "" : "s"}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy("");
    }
  }

  async function createDeal(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      setBusy("create");
      const contract = await signerContract();
      const tx = await contract.createDeal(seller, description, {
        value: ethers.parseEther(amount),
      });
      setNotice(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      const created = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((eventLog) => eventLog?.name === "DealCreated");

      const newDealId = created ? created.args.dealId.toString() : dealId;
      setDealId(newDealId);
      setNotice(`Deal #${newDealId} created.`);
      await loadDeal(newDealId);
      await refreshWallet();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy("");
    }
  }

  async function runDealAction(action, label) {
    setError("");
    setNotice("");

    try {
      setBusy(action);
      const contract = await signerContract();
      const tx = await contract[action](deal.id);
      setNotice(`Transaction sent: ${tx.hash}`);
      await tx.wait();
      setNotice(label);
      await loadDeal(deal.id);
      await refreshWallet();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy("");
    }
  }

  async function copyAddress(value) {
    await navigator.clipboard.writeText(value);
    setNotice("Address copied.");
  }

  useEffect(() => {
    refreshWallet();
    if (!window.ethereum) return undefined;

    const handleAccounts = () => refreshWallet();
    const handleChain = () => refreshWallet();
    window.ethereum.on("accountsChanged", handleAccounts);
    window.ethereum.on("chainChanged", handleChain);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccounts);
      window.ethereum.removeListener("chainChanged", handleChain);
    };
  }, [provider]);

  useEffect(() => {
    document.body.className = theme;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const isBuyer = sameAddress(account, deal?.buyer);
  const isSeller = sameAddress(account, deal?.seller);
  const funded = deal?.status === 0;
  const cancelRequested = deal?.status === 2;
  const adminStats = getAdminStats(adminDeals);

  if (view === "landing") {
    return (
      <main className={`escrowly-page ${theme}`}>
        <AnimatedCursor />
        <LandingPage onStart={() => setView("buyer")} onAdmin={() => setView("admin")} theme={theme} toggleTheme={toggleTheme} />
        <Toast kind={error ? "error" : "success"} message={error || notice} onClear={() => (error ? setError("") : setNotice(""))} />
      </main>
    );
  }

  return (
    <main className={`min-h-screen overflow-hidden bg-ink text-zinc-100 ${theme}`}>
      <AnimatedCursor />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,4,41,0.10),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(239,35,60,0.06),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:auto,auto,30px_30px]" />
      <AppShell>
        <header className="flex flex-col gap-4 border-b border-zinc-900 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md border border-ember-700 bg-ember-600/15">
              <Shield className="h-6 w-6 text-ember-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-normal text-white">Escrowly</h1>
              <p className="text-sm text-zinc-400">Contract-held settlement for digital deals</p>
            </div>
          </div>

          <nav className="flex w-full gap-2 overflow-x-auto rounded-md border border-zinc-900 bg-black/50 p-1 lg:w-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`h-10 shrink-0 rounded-md px-4 text-sm font-semibold transition ${
                  view === item.id ? "bg-ember-600 text-white shadow-redline" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
                onClick={() => setView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
            <IconButton onClick={toggleTheme} label="Toggle theme">
              <i className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"}`} />
            </IconButton>

            {account ? (
              <div className="flex h-11 items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-medium">{shortAddress(account)}</span>
                <span className="text-zinc-500">{balance} ETH</span>
              </div>
            ) : null}

            {account ? (
              <SecondaryButton icon={X} onClick={disconnectWallet}>
                Disconnect
              </SecondaryButton>
            ) : (
              <PrimaryButton icon={Wallet} onClick={connectWallet}>
                Connect Wallet
              </PrimaryButton>
            )}
          </div>
        </header>

        {view === "buyer" ? (
          <BuyerDashboard
            account={account}
            busy={busy}
            cancelRequested={cancelRequested}
            chainId={chainId}
            contractAddress={contractAddress}
            copyAddress={copyAddress}
            createDeal={createDeal}
            deal={deal}
            dealId={dealId}
            description={description}
            funded={funded}
            isBuyer={isBuyer}
            isSeller={isSeller}
            loadDeal={loadDeal}
            amount={amount}
            runDealAction={runDealAction}
            seller={seller}
            setAmount={setAmount}
            setDealId={setDealId}
            setDescription={setDescription}
            setSeller={setSeller}
          />
        ) : null}

        {view === "admin" ? (
          <AdminDashboard
            adminDeals={adminDeals}
            adminLoadedAt={adminLoadedAt}
            adminStats={adminStats}
            busy={busy}
            contractAddress={contractAddress}
            loadAdminDeals={loadAdminDeals}
            setDealId={setDealId}
            setView={setView}
          />
        ) : null}

        <Toast kind={error ? "error" : "success"} message={error || notice} onClear={() => (error ? setError("") : setNotice(""))} />
      </AppShell>
    </main>
  );
}

