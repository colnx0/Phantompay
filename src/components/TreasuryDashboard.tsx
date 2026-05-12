"use client";

import { usePhantomPay } from "@/context/PhantomPayContext";
import { Loader2, Wallet, ShieldCheck, Download, Upload, ArrowRightLeft } from "lucide-react";
import { useState } from "react";

export function TreasuryDashboard() {
  const {
    publicBalance,
    privateBalance,
    deposit,
    withdraw,
    isDepositing,
    isWithdrawing,
    isAuthenticated,
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
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        
        {/* Public Balance Card */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
            <div className="p-3 bg-white/5 rounded-2xl">
              <Wallet className="w-6 h-6 text-white/40 group-hover:text-white/80 transition-colors" />
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-sm font-medium text-white/50 tracking-wide uppercase mb-2">Public Treasury</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-white/90">
                {publicBalance?.uiAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
              </span>
              <span className="text-lg font-medium text-white/40">USDC</span>
            </div>
          </div>
          
          <form onSubmit={handleDeposit} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={depAmount}
                onChange={(e) => setDepAmount(e.target.value)}
                placeholder="0.00"
                className="glass-input w-full pl-4 pr-12 font-medium"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/20">USDC</div>
            </div>
            <button
              type="submit"
              disabled={isDepositing || !depAmount || (publicBalance?.uiAmount ?? 0) === 0 || !isAuthenticated}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 active:bg-white/5 text-white/90 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/5"
            >
              {isDepositing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              { !isAuthenticated ? "Auth TEE First" : (publicBalance?.uiAmount ?? 0) === 0 ? "No Funds" : "Deposit" }
            </button>
          </form>
          <div className="mt-4 flex items-center gap-2 text-xs text-white/30 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
            Moves funds into the TEE Enclave
          </div>
        </div>

        {/* The Connector (Desktop Only) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="bg-[#03030a] p-2 rounded-2xl border border-white/10 shadow-xl">
            <div className="bg-white/5 p-2 rounded-xl">
              <ArrowRightLeft className="w-5 h-5 text-white/30" />
            </div>
          </div>
        </div>

        {/* Private Balance Card */}
        <div className="glass-panel-purple rounded-3xl p-6 relative overflow-hidden group">
          {/* Internal glowing orb */}
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-purple-500/20 rounded-full blur-[60px] pointer-events-none group-hover:bg-purple-500/30 transition-colors duration-700" />
          
          <div className="absolute top-0 right-0 p-6 opacity-60 group-hover:opacity-100 transition-opacity duration-500 z-10">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          
          <div className="mb-8 relative z-10">
            <h3 className="text-sm font-medium text-purple-300/60 tracking-wide uppercase mb-2 flex items-center gap-2">
              Private Enclave 
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/20">TEE</span>
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-white shadow-purple-500/20 drop-shadow-lg">
                {privateBalance?.uiAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
              </span>
              <span className="text-lg font-medium text-purple-300/50">USDC</span>
            </div>
          </div>

          <form onSubmit={handleWithdraw} className="flex gap-3 relative z-10">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={privateBalance?.uiAmount}
                value={withAmount}
                onChange={(e) => setWithAmount(e.target.value)}
                placeholder="0.00"
                className="glass-input w-full pl-4 pr-12 font-medium !border-purple-500/20 focus:!border-purple-400/50 !bg-purple-950/20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-300/30">USDC</div>
            </div>
            <button
              type="submit"
              disabled={isWithdrawing || !withAmount || (privateBalance?.uiAmount ?? 0) === 0}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-purple-600/80 hover:bg-purple-500 active:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] border border-purple-400/30"
            >
              {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              { (privateBalance?.uiAmount ?? 0) === 0 ? "Empty Enclave" : "Withdraw" }
            </button>
          </form>
          <div className="mt-4 flex items-center gap-2 text-xs text-purple-200/40 font-medium relative z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400/50"></div>
            Returns funds to public base chain
          </div>
        </div>

      </div>
    </div>
  );
}
