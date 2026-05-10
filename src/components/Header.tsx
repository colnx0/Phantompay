"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { usePhantomPay } from "@/context/PhantomPayContext";
import { Shield, LogOut, Loader2, AlertCircle } from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Header() {
  const { connected, publicKey } = useWallet();
  const {
    isAuthenticated,
    isAuthenticating,
    authenticate,
    logout,
    apiHealthy,
    refreshBalances,
  } = usePhantomPay();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Auto-refresh balances when connected & authenticated
  useEffect(() => {
    if (connected && isAuthenticated) {
      refreshBalances();
    }
  }, [connected, isAuthenticated, refreshBalances]);

  return (
    <header className="border-b border-white/5 bg-white/[0.01] backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white/90">
              PhantomPay
            </h1>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/40">Private Payroll Protocol</span>
              {apiHealthy !== null && (
                <span className={`flex items-center gap-1 ${apiHealthy ? "text-emerald-400" : "text-red-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${apiHealthy ? "bg-emerald-400" : "bg-red-400"}`} />
                  TEE {apiHealthy ? "Online" : "Offline"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {mounted ? (
            <WalletMultiButton className="!bg-white/5 hover:!bg-white/10 !h-10 !rounded-xl transition-colors !font-medium" />
          ) : (
            <div className="w-[150px] h-10 rounded-xl bg-white/5 animate-pulse" />
          )}
          
          {connected && publicKey && !isAuthenticated && (
            <button
              onClick={authenticate}
              disabled={isAuthenticating}
              className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting to TEE...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Auth Private Enclave
                </>
              )}
            </button>
          )}

          {isAuthenticated && (
            <div className="flex items-center gap-3 bg-white/5 rounded-xl pl-4 pr-2 h-10 border border-white/5">
              <div className="flex items-center gap-1.5 text-sm text-purple-300">
                <Shield className="w-3.5 h-3.5" />
                <span>TEE Auth Active</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <button
                onClick={logout}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white/80 transition-colors"
                title="Disconnect from TEE"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
