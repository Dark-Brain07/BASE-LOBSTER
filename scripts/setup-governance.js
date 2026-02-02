const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🦞 Setting up BASE LOBSTER governance...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Load deployment info
    const deploymentPath = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);

    if (!fs.existsSync(deploymentPath)) {
        throw new Error(`Deployment file not found: ${deploymentPath}. Run deploy.js first.`);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    console.log("Loaded deployment from:", deploymentPath);

    // Get contract instances
    const token = await hre.ethers.getContractAt(
        "BaseLobsterToken",
        deployment.contracts.BaseLobsterToken
    );
    const governor = await hre.ethers.getContractAt(
        "BaseLobsterGovernor",
        deployment.contracts.BaseLobsterGovernor
    );
    const treasury = await hre.ethers.getContractAt(
        "BaseLobsterTreasury",
        deployment.contracts.BaseLobsterTreasury
    );

    console.log("\n📋 Contract Addresses:");
    console.log("   Token:    ", deployment.contracts.BaseLobsterToken);
    console.log("   Governor: ", deployment.contracts.BaseLobsterGovernor);
    console.log("   Treasury: ", deployment.contracts.BaseLobsterTreasury);

    // Check voting power
    console.log("\n🗳️ Checking voting power...");
    const votes = await token.getVotes(deployer.address);
    console.log("   Deployer voting power:", hre.ethers.formatEther(votes), "BLSTR");

    // Check treasury balance
    console.log("\n💰 Checking treasury...");
    const treasuryBalance = await hre.ethers.provider.getBalance(deployment.contracts.BaseLobsterTreasury);
    console.log("   Treasury ETH balance:", hre.ethers.formatEther(treasuryBalance), "ETH");

    const treasuryTokenBalance = await token.balanceOf(deployment.contracts.BaseLobsterTreasury);
    console.log("   Treasury BLSTR balance:", hre.ethers.formatEther(treasuryTokenBalance), "BLSTR");

    // Create initial proposal
    console.log("\n📝 Creating initial governance proposal...");

    const proposalDescription = `
# 🦞 Welcome to BASE LOBSTER Governance!

## Proposal #1: Community Initialization

This is the inaugural proposal for the BASE LOBSTER ($BLSTR) community governance system.

### What this proposal does:
- Officially launches the BASE LOBSTER DAO
- Establishes our commitment to halal-compliant, ethical governance
- Sets the foundation for community-driven decision making

### Our Values:
1. **Transparency** - All governance actions are on-chain and verifiable
2. **Community First** - Decisions are made collectively
3. **Ethical Operations** - No gambling, no speculation, pure governance
4. **Inclusion** - Every token holder has a voice

### Vote YES to:
- Affirm your support for the BASE LOBSTER community
- Signal your commitment to ethical governance
- Join us in building something great on Base

🦞 Together, we are the lobsters of the deep! 🦞
  `.trim();

    // For the initial proposal, we'll create a simple "no-op" proposal
    // that just affirms the community launch
    const targets = [deployment.contracts.BaseLobsterTreasury];
    const values = [0];
    const calldatas = ["0x"]; // Empty calldata - no actual execution

    try {
        const tx = await governor.proposeWithMetadata(
            "Community Initialization Proposal",
            "governance_update",
            false, // Not AI generated
            targets,
            values,
            calldatas,
            proposalDescription
        );

        const receipt = await tx.wait();

        // Get proposal ID from event
        const proposalCreatedEvent = receipt.logs.find(
            log => log.fragment && log.fragment.name === "ProposalCreated"
        );

        if (proposalCreatedEvent) {
            const proposalId = proposalCreatedEvent.args[0];
            console.log("✅ Initial proposal created!");
            console.log("   Proposal ID:", proposalId.toString());

            // Get proposal state
            const state = await governor.state(proposalId);
            const stateNames = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];
            console.log("   Status:", stateNames[state]);
        }
    } catch (error) {
        console.log("⚠️ Could not create proposal:", error.message);
        console.log("   This may be because voting delay hasn't passed yet");
    }

    // Display governance parameters
    console.log("\n⚙️ Governance Parameters:");
    console.log("   Voting Delay:", (await governor.votingDelay()).toString(), "seconds (1 day)");
    console.log("   Voting Period:", (await governor.votingPeriod()).toString(), "seconds (3 days)");
    console.log("   Proposal Threshold:", hre.ethers.formatEther(await governor.proposalThreshold()), "BLSTR");

    console.log("\n" + "=".repeat(60));
    console.log("🦞 GOVERNANCE SETUP COMPLETE! 🦞");
    console.log("=".repeat(60));
    console.log("\n📌 Next Steps:");
    console.log("   1. Start the frontend: npm run dev");
    console.log("   2. Start the bot: npm run bot");
    console.log("   3. Connect your wallet and participate!");
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Setup failed:", error);
        process.exit(1);
    });
