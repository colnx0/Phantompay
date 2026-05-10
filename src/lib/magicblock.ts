/**
 * PhantomPay — MagicBlock Private Payments API client
 * Wraps the payments.magicblock.app API for private SPL token operations
 * running inside Intel TDX Trusted Execution Environment via PER (Private Ephemeral Rollup)
 */

const PER_API_BASE = "https://payments.magicblock.app";
const TEE_RPC_DEVNET = "https://devnet-tee.magicblock.app";

export interface AuthToken {
  token: string;
  pubkey: string;
}

export interface BalanceResponse {
  balance: number;
  decimals: number;
  uiAmount: number;
}

export interface TransactionResponse {
  kind: string;
  version: string;
  transactionBase64: string;
  sendTo: "base" | "ephemeral";
  recentBlockhash: string;
  lastValidBlockHeight: number;
  instructionCount: number;
  requiredSigners: string[];
}

export interface TransferRequest {
  from: string;
  to: string;
  mint: string;
  amount: number;
  isPrivate?: boolean;
}

// ─── Auth Flow ────────────────────────────────────────────────────────────────

/**
 * Step 1: Get a challenge string for the wallet to sign
 */
export async function getChallenge(pubkey: string): Promise<string> {
  const res = await fetch(
    `${PER_API_BASE}/v1/spl/challenge?pubkey=${pubkey}`
  );
  if (!res.ok) throw new Error(`Challenge failed: ${res.statusText}`);
  const data = await res.json();
  return data.challenge;
}

/**
 * Step 2: Exchange a signed challenge for a bearer token
 */
export async function login(
  pubkey: string,
  challenge: string,
  signature: string
): Promise<string> {
  const res = await fetch(`${PER_API_BASE}/v1/spl/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pubkey, challenge, signature }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.statusText}`);
  const data = await res.json();
  return data.token;
}

// ─── Balance ──────────────────────────────────────────────────────────────────

/**
 * Public Solana base-chain SPL balance (visible on-chain)
 */
export async function getPublicBalance(
  address: string,
  mint: string
): Promise<BalanceResponse> {
  const res = await fetch(
    `${PER_API_BASE}/v1/spl/balance?address=${address}&mint=${mint}`
  );
  if (!res.ok) throw new Error(`Balance fetch failed: ${res.statusText}`);
  return res.json();
}

/**
 * Private ephemeral rollup balance (only visible with auth token — TEE protected)
 */
export async function getPrivateBalance(
  address: string,
  mint: string,
  token: string
): Promise<BalanceResponse> {
  const res = await fetch(
    `${PER_API_BASE}/v1/spl/private-balance?address=${address}&mint=${mint}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Private balance fetch failed: ${res.statusText}`);
  return res.json();
}

// ─── Transactions ─────────────────────────────────────────────────────────────

/**
 * Build an unsigned deposit transaction (Solana → Private ER)
 */
export async function buildDeposit(
  from: string,
  mint: string,
  amount: number
): Promise<TransactionResponse> {
  const res = await fetch(`${PER_API_BASE}/v1/spl/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner: from, mint, amount }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Deposit build failed: ${err}`);
  }
  return res.json();
}

/**
 * Build an unsigned private SPL transfer (delayed + split for privacy)
 * Requires auth token for private transfer to connect to TEE
 */
export async function buildTransfer(
  req: TransferRequest,
  token?: string
): Promise<TransactionResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${PER_API_BASE}/v1/spl/transfer`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      from: req.from,
      to: req.to,
      mint: req.mint,
      amount: req.amount,
      private: req.isPrivate ?? true,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Transfer build failed: ${err}`);
  }
  return res.json();
}

/**
 * Build an unsigned withdrawal transaction (Private ER → Solana)
 */
export async function buildWithdraw(
  from: string,
  mint: string,
  amount: number,
  token: string
): Promise<TransactionResponse> {
  const res = await fetch(`${PER_API_BASE}/v1/spl/withdraw`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ owner: from, mint, amount }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Withdraw build failed: ${err}`);
  }
  return res.json();
}

/**
 * Check if a mint has been initialized on the Private ER
 */
export async function isMintInitialized(mint: string): Promise<boolean> {
  const res = await fetch(
    `${PER_API_BASE}/v1/spl/is-mint-initialized?mint=${mint}`
  );
  if (!res.ok) return false;
  const data = await res.json();
  return data.initialized ?? false;
}

/**
 * Build an unsigned initialize-mint transaction
 */
export async function buildInitializeMint(
  payer: string,
  mint: string
): Promise<TransactionResponse> {
  const res = await fetch(`${PER_API_BASE}/v1/spl/initialize-mint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payer, mint }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Initialize mint failed: ${err}`);
  }
  return res.json();
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${PER_API_BASE}/v1/health`);
    return res.ok;
  } catch {
    return false;
  }
}

// ─── TEE RPC URL ──────────────────────────────────────────────────────────────

export function getTeeRpcUrl(token: string): string {
  return `${TEE_RPC_DEVNET}?token=${token}`;
}

export { PER_API_BASE, TEE_RPC_DEVNET };
