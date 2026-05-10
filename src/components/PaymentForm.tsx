"use client";

import { useState } from "react";
import { usePhantomPay } from "@/context/PhantomPayContext";
import { Loader2, Shield, Eye, Send, Lock } from "lucide-react";

export function PaymentForm() {
  const { sendPrivatePayment, isSending, privateBalance } = usePhantomPay();
  
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !amount) return;
    
    const uiAmount = parseFloat(amount);
    if (isNaN(uiAmount) || uiAmount <= 0) return;

    await sendPrivatePayment(to, uiAmount, note);
    setAmount("");
    setNote("");
  };

  const totalBalance = (privateBalance?.uiAmount || 0);

  return (
    <form onSubmit={handleSend} className="glass-panel rounded-3xl p-6 relative overflow-hidden h-full flex flex-col group">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-500/10 transition-colors duration-700" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-xl font-semibold tracking-tight text-white/90 flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Send className="w-5 h-5 text-purple-400" />
          </div>
          New Transfer
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-purple-500/10 rounded-md text-purple-300/70 border border-purple-500/20 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Encrypted
        </span>
      </div>

      <div className="space-y-5 flex-1 relative z-10">
        <div className="group/input">
          <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2 group-focus-within/input:text-purple-400 transition-colors">Recipient (Solana Address)</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Recipient's wallet address..."
            className="glass-input w-full"
            required
          />
        </div>

        <div className="group/input">
          <div className="flex justify-between items-end mb-2">
            <label className="block text-xs font-medium text-white/40 uppercase tracking-wider group-focus-within/input:text-purple-400 transition-colors">Amount (USDC)</label>
            <span className="text-xs text-white/40 flex items-center gap-1 font-medium bg-white/5 px-2 py-0.5 rounded-md">
              <Shield className="w-3 h-3 text-purple-400" />
              Available: {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={totalBalance > 0 ? totalBalance : undefined}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="glass-input w-full pr-16"
              required
            />
            <button
              type="button"
              onClick={() => setAmount(totalBalance.toString())}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-purple-300 hover:text-white px-2 py-1 bg-purple-500/20 hover:bg-purple-500/40 rounded border border-purple-500/30 transition-colors"
            >
              MAX
            </button>
          </div>
        </div>

        <div className="group/input">
          <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2 group-focus-within/input:text-purple-400 transition-colors">Note (Optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Q1 Bounty Payment"
            className="glass-input w-full"
          />
        </div>
      </div>

      <div className="mt-8 relative z-10">
        <button
          type="submit"
          disabled={isSending || !to || !amount}
          className="w-full relative group/btn bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-4 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] border border-white/10 hover:-translate-y-0.5"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          <div className="flex items-center justify-center gap-2 relative z-10 text-base">
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Confidentially...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Send Privately
              </>
            )}
          </div>
        </button>

        <div className="flex items-start gap-2 mt-4 text-xs text-white/30 bg-white/5 p-3 rounded-xl border border-white/5">
          <Eye className="w-4 h-4 shrink-0 mt-0.5 text-purple-400/50" />
          <p className="leading-relaxed">
            The counterparty relationship and payment amount are hidden from the base chain. Only the participants can view this transaction.
          </p>
        </div>
      </div>
    </form>
  );
}
