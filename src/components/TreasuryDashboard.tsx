"use client";

import { usePhantomPay } from "@/context/PhantomPayContext";
import { Loader2, ArrowRightLeft, Wallet, ShieldCheck, Download, Upload } from "lucide-react";
import { useState } from "react";

export function TreasuryDashboard() {
  const {
    publicBalance,
    privateBalance,
    deposit,
    withdraw,
    isDepositing,
    isWithdrawing,
  } = usePhantomPay();

  const [depAmount, setDepAmount] = useState("");
  const [withAmount, setWithAmount] = useState("");

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depAmount) return;
    const amount = parseFloat(depAmount);
    if (amount > 0) {
      await deposit(amount);
      setDepAmount("");
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withAmount) return;
    const amount = parseFloat(withAmount);
    if (amount > 0) {
      await withdraw(amount);
      setWithAmount("");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Public Balance Card */}
      <div className="p-6 border border-white/10 rounded-3xl bg-white/[0.02] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
          <Wallet className="w-8 h-8 text-white/10" />
        </div>
        <h3 className="text-white/60 font-medium mb-1">Public Treasury</h3>
        <div className="text-3xl font-bold mb-6">
          {publicBalance?.uiAmount?.toLocaleString() ?? "0.00"} <span className="text-lg text-white/40">USDC</span>
        </div>
        
        <form onSubmit={handleDeposit} className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={depAmount}
            onChange={(e) => setDepAmount(e.target.value)}
            placeholder="Amount"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={isDepositing || !depAmount}
            className="flex-shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {isDepositing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Deposit
          </button>
        </form>
        <p className="text-xs text-white/40 mt-3 text-center">Move funds to the Private Enclave</p>
      </div>

      <div className="hidden md:flex items-center justify-center -mx-3 z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="bg-[#050510] p-2 rounded-full border border-white/10">
          <ArrowRightLeft className="w-6 h-6 text-white/20" />
        </div>
      </div>

      {/* Private Balance Card */}
      <div className="p-6 border border-purple-500/30 rounded-3xl bg-purple-500/[0.02] backdrop-blur-xl relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.1)]">
        <div className="absolute top-0 right-0 p-6">
          <ShieldCheck className="w-8 h-8 text-purple-500/30" />
        </div>
        <h3 className="text-purple-300/80 font-medium mb-1">Private Enclave (TEE)</h3>
        <div className="text-3xl font-bold mb-6 text-purple-100">
          {privateBalance?.uiAmount?.toLocaleString() ?? "0.00"} <span className="text-lg text-purple-300/40">USDC</span>
        </div>

        <form onSubmit={handleWithdraw} className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={privateBalance?.uiAmount}
            value={withAmount}
            onChange={(e) => setWithAmount(e.target.value)}
            placeholder="Amount"
            className="w-full bg-black/40 border border-purple-500/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={isWithdrawing || !withAmount}
            className="flex-shrink-0 flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Withdraw
          </button>
        </form>
        <p className="text-xs text-purple-300/40 mt-3 text-center">Withdraw back to Public Treasury</p>
      </div>
    </div>
  );
}
