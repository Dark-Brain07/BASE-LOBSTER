const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🦞 Starting BASE LOBSTER deployment...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

    // Step 1: Deploy Treasury (TimelockController) first
    console.log("📦 Step 1: Deploying BaseLobsterTreasury...");

    const minDelay = 86400; // 1 day in seconds
    const proposers = []; // Will be set to Governor after deployment
    const executors = [hre.ethers.ZeroAddress]; // Anyone can execute after delay
    const admin = deployer.address; // Temporary admin, will be renounced

    const Treasury = await hre.ethers.getContractFactory("BaseLobsterTreasury");
    const treasury = await Treasury.deploy(minDelay, proposers, executors, admin);
    await treasury.waitForDeployment();

    const treasuryAddress = await treasury.getAddress();
    console.log("✅ BaseLobsterTreasury deployed to:", treasuryAddress);

    // Step 2: Deploy Token
    console.log("\n📦 Step 2: Deploying BaseLobsterToken...");

    // For community claims, we'll use the deployer address initially
    // In production, this would be a vesting/claim contract
    const communityClaimAddress = deployer.address;
    const teamAddress = deployer.address;

    const Token = await hre.ethers.getContractFactory("BaseLobsterToken");
    const token = await Token.deploy(treasuryAddress, communityClaimAddress, teamAddress);
    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();
    console.log("✅ BaseLobsterToken deployed to:", tokenAddress);

    // Step 3: Deploy Governor
    console.log("\n📦 Step 3: Deploying BaseLobsterGovernor...");

    const Governor = await hre.ethers.getContractFactory("BaseLobsterGovernor");
    const governor = await Governor.deploy(tokenAddress, treasuryAddress);
    await governor.waitForDeployment();

    const governorAddress = await governor.getAddress();
    console.log("✅ BaseLobsterGovernor deployed to:", governorAddress);

    // Step 4: Setup governance roles
    console.log("\n🔧 Step 4: Setting up governance roles...");

    // Grant proposer role to Governor
    const PROPOSER_ROLE = await treasury.PROPOSER_ROLE();
    await treasury.grantRole(PROPOSER_ROLE, governorAddress);
    console.log("✅ Governor granted PROPOSER_ROLE on Treasury");

    // Grant executor role to Governor
    const EXECUTOR_ROLE = await treasury.EXECUTOR_ROLE();
    await treasury.grantRole(EXECUTOR_ROLE, governorAddress);
    console.log("✅ Governor granted EXECUTOR_ROLE on Treasury");

    // Renounce admin role for decentralization
    const ADMIN_ROLE = await treasury.DEFAULT_ADMIN_ROLE();
    await treasury.renounceRole(ADMIN_ROLE, deployer.address);
    console.log("✅ Admin role renounced on Treasury");

    // Step 5: Delegate votes to self (for testing)
    console.log("\n🗳️ Step 5: Self-delegating votes for deployer...");
    await token.delegate(deployer.address);
    console.log("✅ Votes delegated to deployer");

    // Step 6: Save deployment addresses
    console.log("\n💾 Step 6: Saving deployment addresses...");

    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        contracts: {
            BaseLobsterToken: tokenAddress,
            BaseLobsterGovernor: governorAddress,
            BaseLobsterTreasury: treasuryAddress
        }
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentPath = path.join(deploymentsDir, `${hre.network.name}.json`);
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("✅ Deployment info saved to:", deploymentPath);

    // Update .env file with contract addresses
    const envPath = path.join(__dirname, "..", ".env");
    let envContent = fs.readFileSync(envPath, "utf8");

    envContent = envContent.replace(
        /NEXT_PUBLIC_TOKEN_ADDRESS=.*/,
        `NEXT_PUBLIC_TOKEN_ADDRESS=${tokenAddress}`
    );
    envContent = envContent.replace(
        /NEXT_PUBLIC_GOVERNOR_ADDRESS=.*/,
        `NEXT_PUBLIC_GOVERNOR_ADDRESS=${governorAddress}`
    );
    envContent = envContent.replace(
        /NEXT_PUBLIC_TREASURY_ADDRESS=.*/,
        `NEXT_PUBLIC_TREASURY_ADDRESS=${treasuryAddress}`
    );

    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env file updated with contract addresses");

    // Step 7: Verify contracts
    console.log("\n🔍 Step 7: Verifying contracts on BaseScan...");

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        try {
            console.log("Verifying BaseLobsterTreasury...");
            await hre.run("verify:verify", {
                address: treasuryAddress,
                constructorArguments: [minDelay, proposers, executors, admin],
            });
            console.log("✅ BaseLobsterTreasury verified");
        } catch (e) {
            console.log("⚠️ Treasury verification failed:", e.message);
        }

        try {
            console.log("Verifying BaseLobsterToken...");
            await hre.run("verify:verify", {
                address: tokenAddress,
                constructorArguments: [treasuryAddress, communityClaimAddress, teamAddress],
            });
            console.log("✅ BaseLobsterToken verified");
        } catch (e) {
            console.log("⚠️ Token verification failed:", e.message);
        }

        try {
            console.log("Verifying BaseLobsterGovernor...");
            await hre.run("verify:verify", {
                address: governorAddress,
                constructorArguments: [tokenAddress, treasuryAddress],
            });
            console.log("✅ BaseLobsterGovernor verified");
        } catch (e) {
            console.log("⚠️ Governor verification failed:", e.message);
        }
    } else {
        console.log("⏭️ Skipping verification on local network");
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🦞 BASE LOBSTER DEPLOYMENT COMPLETE! 🦞");
    console.log("=".repeat(60));
    console.log("\n📜 Contract Addresses:");
    console.log("   Token:    ", tokenAddress);
    console.log("   Governor: ", governorAddress);
    console.log("   Treasury: ", treasuryAddress);
    console.log("\n📊 Token Distribution:");
    console.log("   Treasury (50%):  500,000 BLSTR");
    console.log("   Community (30%): 300,000 BLSTR");
    console.log("   Team (20%):      200,000 BLSTR");
    console.log("\n🔗 View on BaseScan:");

    const explorerBase = hre.network.name === "base"
        ? "https://basescan.org"
        : "https://sepolia.basescan.org";
    console.log(`   ${explorerBase}/address/${tokenAddress}`);
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
