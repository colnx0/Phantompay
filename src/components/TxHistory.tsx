"use client";

import { usePhantomPay } from "@/context/PhantomPayContext";
import { formatTokenAmount, shortenAddress, truncate } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, XCircle } from "lucide-react";

export function TxHistory() {
  const { txHistory } = usePhantomPay();

  if (txHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-white/5 rounded-2xl bg-white/[0.02]">
        <Clock className="w-8 h-8 mb-3 text-white/20" />
        <h3 className="text-white/60 font-medium">No transactions yet</h3>
        <p className="text-sm text-white/40 mt-1">Your payment history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {txHistory.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                tx.type === "deposit" || tx.type === "receive"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              {tx.type === "deposit" || tx.type === "receive" ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white/90 capitalize">
                  {tx.type} {tx.isPrivate && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 ml-1">Private</span>}
                </span>
                {tx.status === "confirmed" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {tx.status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
                {tx.status === "pending" && <Clock className="w-4 h-4 text-amber-500 animate-pulse" />}
              </div>
              <div className="text-sm text-white/50">
                {tx.to ? `To: ${shortenAddress(tx.to)}` : null}
                {tx.from ? `From: ${shortenAddress(tx.from)}` : null}
                {!tx.to && !tx.from && new Date(tx.timestamp).toLocaleString()}
                {tx.note && ` • "${truncate(tx.note, 15)}"`}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="font-medium text-white/90">
              {formatTokenAmount(tx.amount)}
            </div>
            {tx.txSignature && (
              <a
                href={`https://explorer.solana.com/tx/${tx.txSignature}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                View Tx
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
