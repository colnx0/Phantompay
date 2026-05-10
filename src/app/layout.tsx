import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PhantomPay — Private Payroll & Bounty Protocol on Solana",
  description:
    "Pay contributors, distribute grants, and settle DAO bounties privately — powered by MagicBlock's Private Ephemeral Rollup (PER) and Intel TDX Trusted Execution Environment.",
  keywords: ["Solana", "MagicBlock", "Privacy", "DAO", "Payroll", "DeFi", "PER", "TEE"],
  authors: [{ name: "PhantomPay" }],
  openGraph: {
    title: "PhantomPay — Private Payroll on Solana",
    description:
      "Private on-chain payments powered by MagicBlock's Private Ephemeral Rollup",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#050510] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
