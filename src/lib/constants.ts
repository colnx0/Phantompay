// ─── Network Constants ────────────────────────────────────────────────────────

export const SOLANA_RPC_DEVNET = "https://api.devnet.solana.com";
export const PER_API_BASE = "https://payments.magicblock.app";
export const TEE_RPC_DEVNET = "https://devnet-tee.magicblock.app";

// TEE Validator pubkey (devnet)
export const TEE_VALIDATOR_DEVNET = "MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo";

// ─── Well-known Devnet Mints (for demo) ───────────────────────────────────────

// Devnet USDC-like token for testing
export const DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

// ─── App Config ───────────────────────────────────────────────────────────────

export const APP_NAME = "PhantomPay";
export const APP_TAGLINE = "Private Payroll & Bounty Protocol on Solana";
export const APP_DESCRIPTION =
  "Pay contributors, distribute grants, and settle DAO bounties privately — powered by MagicBlock's Private Ephemeral Rollup (PER) and Intel TDX Trusted Execution Environment.";

// ─── Privacy Levels ───────────────────────────────────────────────────────────

export type PrivacyLevel = "public" | "private";

export const PRIVACY_DESCRIPTIONS: Record<PrivacyLevel, string> = {
  public: "Amount visible on Solana Explorer — standard SPL transfer",
  private:
    "Amount hidden in TEE — delayed + split routing via Private ER. Only sender & recipient can see the balance.",
};
