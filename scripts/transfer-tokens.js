const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const TOKEN_ADDRESS = "0xFdf71B8b3d2F08c8728ee56fB64C283B19BeAEd8";
const RECIPIENT = "0xfd4960F33670f3477ebe817B184dd59fC4961437";
const AMOUNT = "10000"; // 10,000 BLSTR

const TOKEN_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address) view returns (uint256)",
    "function symbol() view returns (string)"
];

async function transferTokens() {
    console.log("🦞 BASE LOBSTER Token Transfer\n");

    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, wallet);

    console.log("From:", wallet.address);
    console.log("To:", RECIPIENT);
    console.log("Amount:", AMOUNT, "BLSTR\n");

    // Check sender balance
    const senderBalance = await token.balanceOf(wallet.address);
    console.log("Sender Balance:", ethers.formatEther(senderBalance), "BLSTR");

    // Transfer tokens
    console.log("\n📝 Sending transaction...");
    const tx = await token.transfer(RECIPIENT, ethers.parseEther(AMOUNT));
    console.log("TX Hash:", tx.hash);

    console.log("⏳ Waiting for confirmation...\n");
    const receipt = await tx.wait();
    console.log("✅ Confirmed in block:", receipt.blockNumber);

    // Check new balances
    const newSenderBal = await token.balanceOf(wallet.address);
    const recipientBal = await token.balanceOf(RECIPIENT);

    console.log("\n📊 New Balances:");
    console.log("   Sender:", ethers.formatEther(newSenderBal), "BLSTR");
    console.log("   Recipient:", ethers.formatEther(recipientBal), "BLSTR");

    console.log("\n🎉 Transfer complete!");
    console.log("   View: https://sepolia.basescan.org/tx/" + tx.hash);
}

transferTokens().catch(console.error);
