"use client";

import { useState } from "react";
import { usePhantomPay } from "@/context/PhantomPayContext";
import { Loader2, Shield, Eye, Send } from "lucide-react";

export function PaymentForm() {
  const { sendPrivatePayment, isSending, publicBalance, privateBalance } = usePhantomPay();
  
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
    <form onSubmit={handleSend} className="p-6 border border-white/10 rounded-3xl bg-white/[0.02] backdrop-blur-xl relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Send className="w-5 h-5 text-purple-400" />
        Send Payment
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">Recipient (Solana Address)</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Recipient's wallet address..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-colors"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-end mb-1.5">
            <label className="block text-sm font-medium text-white/60">Amount (USDC)</label>
            <span className="text-xs text-white/40 flex items-center gap-1">
              <Shield className="w-3 h-3 text-purple-400" />
              Private Available: {totalBalance.toFixed(2)}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={totalBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setAmount(totalBalance.toString())}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-purple-400 hover:text-purple-300 px-2 py-1 bg-purple-500/10 rounded-md transition-colors"
            >
              MAX
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">Note (Optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Q1 Bounty Payment"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSending || !to || !amount}
          className="w-full relative group mt-6 bg-purple-600 hover:bg-purple-500 text-white font-medium py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-white/20 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <div className="flex items-center justify-center gap-2 relative z-10">
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Private Transfer...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Send Privately
              </>
            )}
          </div>
        </button>

        <p className="text-center text-xs text-white/40 flex items-center justify-center gap-1.5 mt-4">
          <Eye className="w-3.5 h-3.5" />
          Amount and counterparty are hidden from the public network
        </p>
      </div>
    </form>
  );
}
