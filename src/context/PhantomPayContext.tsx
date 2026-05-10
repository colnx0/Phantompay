"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Transaction, VersionedTransaction } from "@solana/web3.js";
import {
  getChallenge,
  login,
  getPublicBalance,
  getPrivateBalance,
  buildDeposit,
  buildTransfer,
  buildWithdraw,
  isMintInitialized,
  buildInitializeMint,
  checkHealth,
  getTeeRpcUrl,
  type AuthToken,
  type BalanceResponse,
  type TransactionResponse,
} from "@/lib/magicblock";
import { SOLANA_RPC_DEVNET, DEVNET_USDC_MINT } from "@/lib/constants";
import bs58 from "bs58";

interface PhantomPayContextType {
  // Auth state
  authToken: AuthToken | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authenticate: () => Promise<void>;
  logout: () => void;

  // Balance state
  publicBalance: BalanceResponse | null;
  privateBalance: BalanceResponse | null;
  isLoadingBalance: boolean;
  refreshBalances: () => Promise<void>;

  // Transaction actions
  deposit: (uiAmount: number) => Promise<string | null>;
  sendPrivatePayment: (to: string, uiAmount: number, note?: string) => Promise<string | null>;
  withdraw: (uiAmount: number) => Promise<string | null>;
  initializeMint: () => Promise<boolean>;
  mintInitialized: boolean | null;

  // API health
  apiHealthy: boolean | null;
  
  // Transaction history (local)
  txHistory: PaymentRecord[];
  addTxRecord: (record: PaymentRecord) => void;

  // Loading states
  isDepositing: boolean;
  isSending: boolean;
  isWithdrawing: boolean;

  // Error
  error: string | null;
  clearError: () => void;
}

export interface PaymentRecord {
  id: string;
  type: "deposit" | "send" | "receive" | "withdraw";
  amount: number;
  to?: string;
  from?: string;
  note?: string;
  isPrivate: boolean;
  timestamp: number;
  txSignature?: string;
  status: "pending" | "confirmed" | "failed";
}

const PhantomPayContext = createContext<PhantomPayContextType | null>(null);

export function PhantomPayProvider({ children }: { children: ReactNode }) {
  const { publicKey, signMessage, signTransaction, connected } = useWallet();

  const [authToken, setAuthToken] = useState<AuthToken | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [publicBalance, setPublicBalance] = useState<BalanceResponse | null>(null);
  const [privateBalance, setPrivateBalance] = useState<BalanceResponse | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [mintInitialized, setMintInitialized] = useState<boolean | null>(null);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [txHistory, setTxHistory] = useState<PaymentRecord[]>([]);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // ─── Auth ────────────────────────────────────────────────────────────────────

  const authenticate = useCallback(async () => {
    if (!publicKey || !signMessage) throw new Error("Wallet not connected");
    setIsAuthenticating(true);
    setError(null);
    try {
      const pubkey = publicKey.toBase58();
      const challenge = await getChallenge(pubkey);

      // Sign the challenge with the connected wallet
      const messageBytes = new TextEncoder().encode(challenge);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      const token = await login(pubkey, challenge, signature);
      setAuthToken({ token, pubkey });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, signMessage]);

  const logout = useCallback(() => {
    setAuthToken(null);
    setPrivateBalance(null);
  }, []);

  // ─── Balances ─────────────────────────────────────────────────────────────────

  const refreshBalances = useCallback(async () => {
    if (!publicKey) return;
    setIsLoadingBalance(true);
    try {
      const pubkey = publicKey.toBase58();

      // Public balance always available
      const pub = await getPublicBalance(pubkey, DEVNET_USDC_MINT).catch(() => null);
      setPublicBalance(pub);

      // Private balance requires auth
      if (authToken) {
        const priv = await getPrivateBalance(pubkey, DEVNET_USDC_MINT, authToken.token).catch(() => null);
        setPrivateBalance(priv);
      }

      // Check mint initialization
      const initialized = await isMintInitialized(DEVNET_USDC_MINT).catch(() => false);
      setMintInitialized(initialized);

      // Check API health
      const healthy = await checkHealth();
      setApiHealthy(healthy);
    } catch (err: unknown) {
      console.error("Balance refresh failed:", err);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [publicKey, authToken]);

  // ─── Sign & Send helper ───────────────────────────────────────────────────────

  const signAndSend = useCallback(
    async (res: TransactionResponse, token?: string): Promise<string> => {
      if (!publicKey || !signTransaction) throw new Error("Wallet not connected");

      const rpcUrl =
        res.sendTo === "ephemeral" && token
          ? getTeeRpcUrl(token)
          : SOLANA_RPC_DEVNET;

      const connection = new Connection(rpcUrl, "confirmed");
      const txBytes = Buffer.from(res.transactionBase64, "base64");

      // Try as versioned first, fall back to legacy
      let signature: string;
      try {
        const vtx = VersionedTransaction.deserialize(txBytes);
        const signed = await signTransaction(vtx as never);
        signature = await connection.sendRawTransaction((signed as VersionedTransaction).serialize());
      } catch {
        const tx = Transaction.from(txBytes);
        const signed = await signTransaction(tx as never);
        signature = await connection.sendRawTransaction((signed as Transaction).serialize());
      }

      await connection.confirmTransaction({
        signature,
        blockhash: res.recentBlockhash,
        lastValidBlockHeight: res.lastValidBlockHeight,
      }, "confirmed");
      return signature;
    },
    [publicKey, signTransaction]
  );

  // ─── Initialize Mint ─────────────────────────────────────────────────────────

  const initializeMint = useCallback(async (): Promise<boolean> => {
    if (!publicKey) return false;
    try {
      const res = await buildInitializeMint(publicKey.toBase58(), DEVNET_USDC_MINT);
      await signAndSend(res);
      setMintInitialized(true);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to initialize mint";
      setError(message);
      return false;
    }
  }, [publicKey, signAndSend]);

  // ─── Deposit ─────────────────────────────────────────────────────────────────

  const deposit = useCallback(
    async (uiAmount: number): Promise<string | null> => {
      if (!publicKey) return null;
      setIsDepositing(true);
      setError(null);
      const record: PaymentRecord = {
        id: `dep-${Date.now()}`,
        type: "deposit",
        amount: uiAmount,
        isPrivate: false,
        timestamp: Date.now(),
        status: "pending",
      };
      try {
        addTxRecord(record);
        const rawAmount = Math.round(uiAmount * 1_000_000);
        const res = await buildDeposit(publicKey.toBase58(), DEVNET_USDC_MINT, rawAmount);
        const sig = await signAndSend(res);
        updateTxRecord(record.id, { status: "confirmed", txSignature: sig });
        await refreshBalances();
        return sig;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Deposit failed";
        setError(message);
        updateTxRecord(record.id, { status: "failed" });
        return null;
      } finally {
        setIsDepositing(false);
      }
    },
    [publicKey, signAndSend, refreshBalances]
  );

  // ─── Private Transfer ─────────────────────────────────────────────────────────

  const sendPrivatePayment = useCallback(
    async (to: string, uiAmount: number, note?: string): Promise<string | null> => {
      if (!publicKey || !authToken) return null;
      setIsSending(true);
      setError(null);
      const record: PaymentRecord = {
        id: `send-${Date.now()}`,
        type: "send",
        amount: uiAmount,
        to,
        note,
        isPrivate: true,
        timestamp: Date.now(),
        status: "pending",
      };
      try {
        addTxRecord(record);
        const rawAmount = Math.round(uiAmount * 1_000_000);
        const res = await buildTransfer(
          {
            from: publicKey.toBase58(),
            to,
            mint: DEVNET_USDC_MINT,
            amount: rawAmount,
            isPrivate: true,
          },
          authToken.token
        );
        const sig = await signAndSend(res, authToken.token);
        updateTxRecord(record.id, { status: "confirmed", txSignature: sig });
        await refreshBalances();
        return sig;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Payment failed";
        setError(message);
        updateTxRecord(record.id, { status: "failed" });
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [publicKey, authToken, signAndSend, refreshBalances]
  );

  // ─── Withdraw ────────────────────────────────────────────────────────────────

  const withdraw = useCallback(
    async (uiAmount: number): Promise<string | null> => {
      if (!publicKey || !authToken) return null;
      setIsWithdrawing(true);
      setError(null);
      const record: PaymentRecord = {
        id: `wd-${Date.now()}`,
        type: "withdraw",
        amount: uiAmount,
        isPrivate: false,
        timestamp: Date.now(),
        status: "pending",
      };
      try {
        addTxRecord(record);
        const rawAmount = Math.round(uiAmount * 1_000_000);
        const res = await buildWithdraw(
          publicKey.toBase58(),
          DEVNET_USDC_MINT,
          rawAmount,
          authToken.token
        );
        const sig = await signAndSend(res, authToken.token);
        updateTxRecord(record.id, { status: "confirmed", txSignature: sig });
        await refreshBalances();
        return sig;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Withdrawal failed";
        setError(message);
        updateTxRecord(record.id, { status: "failed" });
        return null;
      } finally {
        setIsWithdrawing(false);
      }
    },
    [publicKey, authToken, signAndSend, refreshBalances]
  );

  // ─── Tx History helpers ───────────────────────────────────────────────────────

  function addTxRecord(record: PaymentRecord) {
    setTxHistory((prev) => [record, ...prev]);
  }

  function updateTxRecord(id: string, updates: Partial<PaymentRecord>) {
    setTxHistory((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }

  const value: PhantomPayContextType = {
    authToken,
    isAuthenticated: !!authToken,
    isAuthenticating,
    authenticate,
    logout,
    publicBalance,
    privateBalance,
    isLoadingBalance,
    refreshBalances,
    deposit,
    sendPrivatePayment,
    withdraw,
    initializeMint,
    mintInitialized,
    apiHealthy,
    txHistory,
    addTxRecord,
    isDepositing,
    isSending,
    isWithdrawing,
    error,
    clearError,
  };

  return (
    <PhantomPayContext.Provider value={value}>
      {children}
    </PhantomPayContext.Provider>
  );
}

export function usePhantomPay(): PhantomPayContextType {
  const ctx = useContext(PhantomPayContext);
  if (!ctx) throw new Error("usePhantomPay must be used within PhantomPayProvider");
  return ctx;
}
