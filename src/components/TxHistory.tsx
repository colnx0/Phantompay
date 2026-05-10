"use client";

import { usePhantomPay } from "@/context/PhantomPayContext";
import { formatTokenAmount, shortenAddress, truncate } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, XCircle, ExternalLink, Lock } from "lucide-react";

export function TxHistory() {
  const { txHistory } = usePhantomPay();

  if (txHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
          <Clock className="w-8 h-8 text-white/20" />
        </div>
        <h3 className="text-white/60 font-medium">No transactions yet</h3>
        <p className="text-sm text-white/30 mt-1 max-w-[200px]">Your deposit and payment history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
      {txHistory.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 border ${
                tx.type === "deposit" || tx.type === "receive"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-purple-500/10 text-purple-400 border-purple-500/20"
              }`}
            >
              {tx.type === "deposit" || tx.type === "receive" ? (
                <ArrowDownLeft className="w-6 h-6" />
              ) : (
                <ArrowUpRight className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white/90 capitalize text-sm">
                  {tx.type}
                </span>
                {tx.isPrivate && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-purple-500/20 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Private
                  </span>
                )}
                {tx.status === "confirmed" && <CheckCircle2 className="w-4 h-4 text-emerald-500/80" />}
                {tx.status === "failed" && <XCircle className="w-4 h-4 text-red-500/80" />}
                {tx.status === "pending" && <Clock className="w-4 h-4 text-amber-500/80 animate-pulse" />}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                {tx.to && (
                  <span>
                    To: <span className="font-medium text-white/60">{shortenAddress(tx.to)}</span>
                  </span>
                )}
                {tx.from && (
                  <span>
                    From: <span className="font-medium text-white/60">{shortenAddress(tx.from)}</span>
                  </span>
                )}
                {!tx.to && !tx.from && <span>{new Date(tx.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                
                {tx.note && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="italic">"{truncate(tx.note, 20)}"</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 pl-4">
            <div className={`font-semibold ${tx.type === 'deposit' || tx.type === 'receive' ? 'text-emerald-400' : 'text-white/90'}`}>
              {tx.type === 'deposit' || tx.type === 'receive' ? '+' : '-'}{formatTokenAmount(tx.amount)} <span className="text-xs text-white/30 font-medium">USDC</span>
            </div>
            {tx.txSignature ? (
              <a
                href={`https://explorer.solana.com/tx/${tx.txSignature}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors mt-1 opacity-0 group-hover:opacity-100"
              >
                View Explorer <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <div className="text-[10px] text-white/20 mt-1">
                {new Date(tx.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
