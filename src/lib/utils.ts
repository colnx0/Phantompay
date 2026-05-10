import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Shorten a pubkey for display: "ABcd...XYZw"
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format a token amount with decimals
 */
export function formatTokenAmount(
  amount: number,
  decimals = 6,
  symbol = "USDC"
): string {
  const ui = amount / Math.pow(10, decimals);
  return `${ui.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${symbol}`;
}

/**
 * Convert UI amount to raw lamports/smallest unit
 */
export function toRawAmount(uiAmount: number, decimals = 6): number {
  return Math.round(uiAmount * Math.pow(10, decimals));
}

/**
 * Convert a signature to base58
 */
export function uint8ArrayToBase58(arr: Uint8Array): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let num = BigInt("0x" + Buffer.from(arr).toString("hex"));
  let result = "";
  const base = BigInt(58);
  while (num > BigInt(0)) {
    result = alphabet[Number(num % base)] + result;
    num = num / base;
  }
  for (const byte of arr) {
    if (byte !== 0) break;
    result = "1" + result;
  }
  return result;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate a string for display
 */
export function truncate(str: string, maxLen = 20): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "…";
}
