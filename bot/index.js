const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { generateProposal, PROPOSAL_TOPICS } = require("./ai-proposals");
const config = require("./config.json");

// Load ABIs and deployment info
let deploymentInfo;
try {
    const deployPath = path.join(__dirname, "..", "deployments", "baseSepolia.json");
    if (fs.existsSync(deployPath)) {
        deploymentInfo = require(deployPath);
        console.log("✅ Loaded deployment info from baseSepolia.json");
    }
} catch (e) {
    console.log("⚠️ No deployment info found. Run deploy script first.");
}

// Governor ABI (simplified)
const GOVERNOR_ABI = [
    "function proposeWithMetadata(string,string,bool,address[],uint256[],bytes[],string) returns (uint256)",
    "function getProposalCount() view returns (uint256)",
    "function state(uint256) view returns (uint8)",
    "function execute(address[],uint256[],bytes[],bytes32) returns (uint256)",
    "function queue(address[],uint256[],bytes[],bytes32) returns (uint256)",
    "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)"
];

// Proposal state enum
const ProposalState = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];

class BaseLobsterBot {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org");
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        this.proposals = [];
        this.logFile = path.join(__dirname, "logs", "bot.log");
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}`;
        console.log(logEntry);
        fs.appendFileSync(this.logFile, logEntry + "\n");
    }

    async initialize() {
        this.log("🦞 BASE LOBSTER Bot Starting...");
        const balance = await this.provider.getBalance(this.wallet.address);
        this.log(`💰 Wallet: ${this.wallet.address}`);
        this.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);

        if (!deploymentInfo) {
            this.log("⚠️ Contracts not deployed. Bot will run in demo mode.");
            return;
        }

        this.governor = new ethers.Contract(deploymentInfo.contracts.BaseLobsterGovernor, GOVERNOR_ABI, this.wallet);
        this.log(`📋 Governor: ${deploymentInfo.contracts.BaseLobsterGovernor}`);
    }

    async generateAndSubmitProposal() {
        const categories = Object.keys(PROPOSAL_TOPICS);
        const category = categories[Math.floor(Math.random() * categories.length)];

        this.log(`🤖 Generating ${category} proposal...`);

        try {
            const proposal = await generateProposal(category);
            this.log(`✅ Generated: "${proposal.title}"`);

            // Save proposal locally
            const proposalsFile = path.join(__dirname, "generated-proposals.json");
            const existing = fs.existsSync(proposalsFile) ? JSON.parse(fs.readFileSync(proposalsFile)) : [];
            existing.push(proposal);
            fs.writeFileSync(proposalsFile, JSON.stringify(existing, null, 2));

            // Submit to blockchain if contracts are deployed
            if (this.governor) {
                await this.submitProposalOnchain(proposal);
            }

            return proposal;
        } catch (error) {
            this.log(`❌ Error generating proposal: ${error.message}`);
            return null;
        }
    }

    async submitProposalOnchain(proposal) {
        try {
            const targets = [deploymentInfo.contracts.BaseLobsterTreasury];
            const values = [0];
            const calldatas = ["0x"];

            const tx = await this.governor.proposeWithMetadata(
                proposal.title,
                proposal.category,
                true, // AI generated
                targets,
                values,
                calldatas,
                proposal.description
            );

            this.log(`📝 Proposal TX: ${tx.hash}`);
            const receipt = await tx.wait();
            this.log(`✅ Proposal submitted in block ${receipt.blockNumber}`);

            return receipt;
        } catch (error) {
            this.log(`❌ Error submitting proposal: ${error.message}`);
            return null;
        }
    }

    async monitorProposals() {
        if (!this.governor) return;

        try {
            const count = await this.governor.getProposalCount();
            this.log(`📊 Total proposals: ${count}`);

            // Check recent proposals for status
            for (let i = Math.max(0, Number(count) - 5); i < Number(count); i++) {
                // Would need to get proposal ID and check state
            }
        } catch (error) {
            this.log(`❌ Error monitoring: ${error.message}`);
        }
    }

    async run() {
        await this.initialize();

        this.log(`\n🦞 Bot running! Interval: ${config.botInterval / 1000 / 60} minutes\n`);

        // Generate initial proposal
        await this.generateAndSubmitProposal();

        // Set up interval
        setInterval(async () => {
            this.log("\n⏰ Running scheduled task...");
            await this.generateAndSubmitProposal();
            await this.monitorProposals();
        }, config.botInterval);

        // Keep process alive
        process.on("SIGINT", () => {
            this.log("\n👋 Bot shutting down...");
            process.exit(0);
        });
    }
}

// Run the bot
const bot = new BaseLobsterBot();
bot.run().catch(console.error);
