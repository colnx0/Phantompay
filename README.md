# 🔐 PhantomPay — Private Payroll & Bounty Protocol

**Built for the Superteam Colosseum Hackathon (Privacy Track powered by MagicBlock)**

PhantomPay is a decentralized payroll and grant distribution protocol that allows DAOs and Web3 enterprises to pay contributors privately on Solana. Built natively on MagicBlock's Private Ephemeral Rollup (PER) and the Intel TDX Trusted Execution Environment.

## 🎯 The Problem
On Solana, all transactions are public. For DAOs and companies, this means:
- **Salary Leaks**: Team members can see what everyone else is paid.
- **Bounty Front-running**: Competitive grants reveal treasury strategies.
- **Enterprise Friction**: Traditional businesses cannot move payroll on-chain due to data privacy compliance.

## ✨ The Solution
PhantomPay uses MagicBlock's **Private Ephemeral Rollups (PER)** to move SPL token balances and transfers into a confidential enclave. 

- **Private Treasuries**: Deposit funds into the TEE.
- **Confidential Transfers**: Send USDC to contributors where neither the amount nor the counterparty relationship is published to the base chain.
- **Seamless Composable Exit**: Contributors can withdraw their private balances back to the public Solana state at any time.

## 🛠️ Technical Implementation
1. **MagicBlock Payments API**: Deep integration with `payments.magicblock.app` for deposit, transfer, and withdrawal flows.
2. **Intel TDX Authentication**: Uses wallet signature challenges to securely map Solana public keys to private TEE sessions.
3. **Delayed & Split Routing**: Obfuscates the timing and amounts of payments returning to the base chain.

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

> **Note**: Requires a Solana wallet (Phantom, Backpack, Solflare) connected to Devnet.

## 🔗 Architecture
- **Frontend**: Next.js 14, TailwindCSS, React Context
- **Web3**: `@solana/web3.js`, Wallet Adapter
- **Privacy Engine**: `@magicblock-labs/ephemeral-rollups-sdk`

---
*Built with 💜 for the Solana Colosseum.*
