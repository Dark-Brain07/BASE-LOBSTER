# 🦞 BASE LOBSTER ($BLSTR)

AI-Powered, Halal-Compliant Governance Token on Base Blockchain

![BASE LOBSTER](https://img.shields.io/badge/BASE-LOBSTER-blue?style=for-the-badge&logo=ethereum)
![OpenClaw](https://img.shields.io/badge/OpenClaw-Builder%20Quest-purple?style=for-the-badge)

## 🌟 Overview

BASE LOBSTER is a full-stack governance dApp built for the OpenClaw Builder Quest. It features:

- **🪙 ERC20 Governance Token** - $BLSTR with voting power delegation
- **🗳️ Governor Contract** - On-chain proposal creation and voting
- **💰 Treasury** - Community fund with transparent management
- **🤖 AI Bot** - Gemini-powered proposal generation
- **🌐 Next.js Frontend** - Beautiful, responsive web application

## ☪️ Halal-Compliant Design

No gambling, no speculation. Pure governance:
- ✅ Fixed supply (1M tokens)
- ✅ Voting power only
- ✅ Transparent treasury
- ❌ No staking rewards
- ❌ No lottery mechanics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask wallet with Base ETH

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/base-lobster-bot.git
cd base-lobster-bot

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your keys
```

### Environment Variables

```env
PRIVATE_KEY=your_wallet_private_key
BASESCAN_API_KEY=your_basescan_key
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_id
```

### Development

```bash
# Run frontend
npm run dev

# Compile contracts
npm run compile

# Run tests
npm run test
```

### Deployment

```bash
# Deploy to Base Sepolia (testnet)
npm run deploy:sepolia

# Deploy to Base Mainnet
npm run deploy:mainnet

# Run the AI bot
npm run bot
```

## 📁 Project Structure

```
base-lobster-bot/
├── contracts/           # Solidity smart contracts
│   ├── BaseLobsterToken.sol
│   ├── BaseLobsterGovernor.sol
│   └── BaseLobsterTreasury.sol
├── app/                 # Next.js pages
├── components/          # React components
├── bot/                 # Autonomous AI bot
├── scripts/             # Deployment scripts
└── lib/                 # Utilities
```

## 📜 Smart Contracts

| Contract | Description |
|----------|-------------|
| BaseLobsterToken | ERC20 with voting (1M supply) |
| BaseLobsterGovernor | Governance with 3-day voting |
| BaseLobsterTreasury | TimelockController treasury |

### Governance Parameters
- Voting Delay: 1 day
- Voting Period: 3 days
- Quorum: 10%
- Execution Delay: 1 day

## 📊 Tokenomics

| Allocation | Percentage | Amount |
|------------|------------|--------|
| Treasury | 50% | 500,000 |
| Community | 30% | 300,000 |
| Team | 20% | 200,000 |

## 🤖 AI Bot

The bot generates governance proposals every 6 hours:
- 💝 Charity donations
- 🎉 Community events
- ⚡ Feature requests
- 🤝 Partnerships

```bash
# Start the bot
npm run bot
```

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

## 📝 License

MIT License

---

🦞 Built with ❤️ for the OpenClaw Builder Quest 🦞
