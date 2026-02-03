const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🦞 Deploying BaseLobsterFaucet...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

    // Load existing deployment info
    const deploymentPath = path.join(__dirname, "..", "deployments", "baseSepolia.json");
    if (!fs.existsSync(deploymentPath)) {
        console.error("❌ No deployment info found. Deploy main contracts first.");
        process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const tokenAddress = deploymentInfo.contracts.BaseLobsterToken;
    console.log("Token Address:", tokenAddress);

    // Deploy Faucet
    console.log("\n📦 Deploying Faucet...");
    const Faucet = await hre.ethers.getContractFactory("BaseLobsterFaucet");
    const faucet = await Faucet.deploy(tokenAddress);
    await faucet.waitForDeployment();

    const faucetAddress = await faucet.getAddress();
    console.log("✅ Faucet deployed to:", faucetAddress);

    // Transfer 25,000 BLSTR to faucet
    console.log("\n💰 Transferring 25,000 BLSTR to faucet...");
    const Token = await hre.ethers.getContractFactory("BaseLobsterToken");
    const token = Token.attach(tokenAddress);

    const transferAmount = hre.ethers.parseEther("25000");
    const tx = await token.transfer(faucetAddress, transferAmount);
    await tx.wait();
    console.log("✅ Transferred 25,000 BLSTR to faucet");

    // Verify faucet balance
    const faucetBalance = await token.balanceOf(faucetAddress);
    console.log("Faucet Balance:", hre.ethers.formatEther(faucetBalance), "BLSTR");

    // Update deployment info
    deploymentInfo.contracts.BaseLobsterFaucet = faucetAddress;
    deploymentInfo.faucet = {
        address: faucetAddress,
        claimAmount: "1",
        cooldown: "24 hours",
        fundedAmount: "25000"
    };

    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n✅ Deployment info updated!\n");

    console.log("=".repeat(50));
    console.log("🦞 FAUCET DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log("Faucet Address:", faucetAddress);
    console.log("Claim Amount: 1 BLSTR");
    console.log("Cooldown: 24 hours");
    console.log("Initial Balance: 25,000 BLSTR");
    console.log("=".repeat(50));
    console.log("\nVerify on BaseScan:");
    console.log(`https://sepolia.basescan.org/address/${faucetAddress}#code`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
