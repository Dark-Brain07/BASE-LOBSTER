const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Deployment info
const GOVERNOR_ADDRESS = "0xb7B0615DfD26574747a4F3f6ACf6e839C7679aCd";
const TREASURY_ADDRESS = "0x218bB0170B22020049d4760ff389F253523AC8d8";

// Governor ABI
const GOVERNOR_ABI = [
    "function proposeWithMetadata(string,string,bool,address[],uint256[],bytes[],string) returns (uint256)",
    "function getProposalCount() view returns (uint256)"
];

async function createTestProposal() {
    console.log("🦞 Creating test proposal...\n");

    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("💰 Wallet:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

    const governor = new ethers.Contract(GOVERNOR_ADDRESS, GOVERNOR_ABI, wallet);

    // Get current proposal count
    const countBefore = await governor.getProposalCount();
    console.log("📊 Current proposals:", countBefore.toString());

    // Create a test proposal
    const title = "Community Initiative: Ocean Conservation Support";
    const category = "charity_donation";
    const isAIGenerated = true;
    const description = `
## Proposal: Ocean Conservation Support 🌊

### Background
As BASE LOBSTER, we have a deep connection to the ocean. This proposal aims to allocate treasury funds to support marine conservation efforts.

### Objectives
- Raise awareness about ocean pollution
- Support verified ocean cleanup organizations
- Build partnerships with environmental groups

### Implementation
1. Research and identify reputable ocean conservation charities
2. Allocate 0.05 ETH from treasury
3. Publish donation receipts on-chain for transparency

### Expected Outcomes
- Direct contribution to ocean cleanup efforts
- Positive community impact
- Enhanced reputation for BASE LOBSTER DAO

**Vote YES to support this initiative! 🦞**
    `;

    console.log("\n📝 Submitting proposal...");
    console.log("   Title:", title);
    console.log("   Category:", category);

    try {
        const tx = await governor.proposeWithMetadata(
            title,
            category,
            isAIGenerated,
            [TREASURY_ADDRESS],
            [0],
            ["0x"],
            description
        );

        console.log("\n⏳ Transaction submitted:", tx.hash);
        console.log("   Waiting for confirmation...\n");

        const receipt = await tx.wait();
        console.log("✅ Proposal created in block:", receipt.blockNumber);

        // Get new count
        const countAfter = await governor.getProposalCount();
        console.log("📊 New proposal count:", countAfter.toString());

        console.log("\n🎉 Success! Your proposal has been created.");
        console.log("   View at: https://sepolia.basescan.org/tx/" + tx.hash);

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

createTestProposal();
