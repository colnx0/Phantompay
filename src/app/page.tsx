"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { usePhantomPay } from "@/context/PhantomPayContext";
import { Header } from "@/components/Header";
import { TreasuryDashboard } from "@/components/TreasuryDashboard";
import { PaymentForm } from "@/components/PaymentForm";
import { TxHistory } from "@/components/TxHistory";
import { Shield, AlertTriangle, Info, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    publicBalance,
    privateBalance,
  } = usePhantomPay();

  return (
    <div className="min-h-screen flex flex-col selection:bg-purple-500/30">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-8 pb-20">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-md">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-red-200">
              <p className="font-medium text-red-100">Error Occurred</p>
              <p className="mt-1 opacity-80">{error}</p>
            </div>
            <button onClick={clearError} className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-500/10">
              ✕
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!connected ? (
            <motion.div 
              key="unconnected"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              className="flex flex-col items-center justify-center h-[65vh] text-center space-y-8"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-purple-500/20 blur-[60px] rounded-full group-hover:bg-purple-500/30 transition-all duration-700"></div>
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-24 h-24 relative bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-3xl flex items-center justify-center shadow-2xl"
                >
                  <Shield className="w-12 h-12 text-purple-400" />
                </motion.div>
              </div>
              <div className="max-w-xl space-y-4">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-4xl sm:text-5xl font-bold tracking-tight text-white/90"
                >
                  Private DAO Payroll
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-lg text-white/50 leading-relaxed font-light"
                >
                  Connect your wallet to access the Private Ephemeral Rollup enclave. 
                  Pay contributors and settle bounties securely without exposing your treasury strategies to the public chain.
                </motion.p>
              </div>
            </motion.div>
          ) : !isAuthenticated ? (
            <motion.div 
              key="unauthenticated"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.6, type: "spring" }}
              className="flex flex-col items-center justify-center h-[65vh] text-center space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-[50px] rounded-full"></div>
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-20 h-20 relative bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-3xl flex items-center justify-center"
                >
                  <Shield className="w-10 h-10 text-blue-400" />
                </motion.div>
              </div>
              <div className="max-w-lg space-y-3">
                <h2 className="text-3xl font-bold tracking-tight text-white/90">
                  Authenticate with TEE
                </h2>
                <p className="text-white/50 font-light leading-relaxed">
                  Sign a message to prove wallet ownership. This generates a secure session to read your private balances stored inside the Intel TDX Trusted Execution Environment.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delayChildren: 0.2, staggerChildren: 0.1 }}
              className="space-y-10"
            >
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-6"
              >
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-white/90">Treasury Operations</h2>
                  <p className="text-white/40 text-sm mt-1">Manage public funds and private payroll allocations</p>
                </div>
                <button 
                  onClick={refreshBalances} 
                  disabled={isLoadingBalance}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? 'animate-spin text-purple-400' : ''}`} />
                  <span className="text-sm font-medium">Sync State</span>
                </button>
              </motion.div>

              {mintInitialized === false && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="glass-panel border-blue-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] pointer-events-none rounded-full" />
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="p-2 bg-blue-500/10 rounded-lg shrink-0 mt-0.5">
                      <Info className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-100">Mint Initialization Required</h4>
                      <p className="text-xs text-blue-200/60 mt-1">
                        The DEVNET USDC mint hasn't been initialized on the ephemeral rollup yet. This is a one-time setup.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={initializeMint}
                    className="shrink-0 px-5 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm font-medium rounded-xl border border-blue-500/30 transition-colors relative z-10"
                  >
                    Initialize Mint
                  </button>
                </motion.div>
              )}

              {(publicBalance?.uiAmount === 0 && privateBalance?.uiAmount === 0) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden"
                >
                  <div className="p-2 bg-purple-500/20 rounded-lg shrink-0 mt-0.5">
                    <Info className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-purple-200">Demo Mode Active (Devnet)</h4>
                    <p className="text-xs text-purple-300/60 mt-1 leading-relaxed">
                      You are running on Solana Devnet. All funds here are 100% fake. 
                      To test the application, open your Phantom Wallet settings, switch to Devnet, and request a Devnet SOL airdrop. Then you can swap it for Devnet USDC to deposit!
                    </p>
                  </div>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <TreasuryDashboard />
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="lg:col-span-5 xl:col-span-4"
                >
                  <PaymentForm />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="lg:col-span-7 xl:col-span-8"
                >
                  <div className="glass-panel rounded-3xl p-6 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold tracking-tight text-white/90">Transaction History</h3>
                      <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-md text-white/40">Recent Activity</span>
                    </div>
                    <TxHistory />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
