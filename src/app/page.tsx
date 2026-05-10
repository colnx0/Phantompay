"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { usePhantomPay } from "@/context/PhantomPayContext";
import { Header } from "@/components/Header";
import { TreasuryDashboard } from "@/components/TreasuryDashboard";
import { PaymentForm } from "@/components/PaymentForm";
import { TxHistory } from "@/components/TxHistory";
import { Shield, AlertTriangle, Info, RefreshCw } from "lucide-react";

export default function Home() {
  const { connected } = useWallet();
  const {
    isAuthenticated,
    mintInitialized,
    initializeMint,
    error,
    clearError,
    refreshBalances,
    isLoadingBalance,
  } = usePhantomPay();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-8 pb-20">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-red-200">
              <p className="font-medium text-red-100">Error Occurred</p>
              <p className="mt-1 opacity-80">{error}</p>
            </div>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">
              ✕
            </button>
          </div>
        )}

        {!connected ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.2)]">
              <Shield className="w-10 h-10 text-purple-400" />
            </div>
            <div className="max-w-md">
              <h2 className="text-3xl font-bold text-white mb-4">
                Private DAO Payroll
              </h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Connect your wallet to access the Private Ephemeral Rollup enclave. 
                Pay contributors and settle bounties without exposing your treasury strategy.
              </p>
            </div>
          </div>
        ) : !isAuthenticated ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <div className="max-w-md">
              <h2 className="text-2xl font-bold text-white mb-2">
                Authenticate with TEE
              </h2>
              <p className="text-white/60 text-sm">
                Sign a message to prove wallet ownership and access your private balances stored in the Intel TDX Trusted Execution Environment.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Treasury Operations</h2>
              <button 
                onClick={refreshBalances} 
                disabled={isLoadingBalance}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {mintInitialized === false && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-blue-100">
                    The DEVNET USDC mint hasn't been initialized on the ephemeral rollup yet.
                  </span>
                </div>
                <button
                  onClick={initializeMint}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Initialize Mint
                </button>
              </div>
            )}

            <TreasuryDashboard />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <PaymentForm />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-medium text-white/80">Transaction History</h3>
                <TxHistory />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
