// Contract ABIs for BASE LOBSTER
// Using proper JSON ABI format for wagmi/viem compatibility

export const TOKEN_ABI = [
    {
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "getVotes",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "delegates",
        "outputs": [{ "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [{ "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "delegatee", "type": "address" }],
        "name": "delegate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

export const GOVERNOR_ABI = [
    // Governor
    "function name() view returns (string)",
    "function version() view returns (string)",
    "function COUNTING_MODE() pure returns (string)",
    "function votingDelay() view returns (uint256)",
    "function votingPeriod() view returns (uint256)",
    "function proposalThreshold() view returns (uint256)",
    "function quorum(uint256 timepoint) view returns (uint256)",
    "function state(uint256 proposalId) view returns (uint8)",
    "function proposalSnapshot(uint256 proposalId) view returns (uint256)",
    "function proposalDeadline(uint256 proposalId) view returns (uint256)",
    "function proposalProposer(uint256 proposalId) view returns (address)",
    "function proposalEta(uint256 proposalId) view returns (uint256)",
    "function hasVoted(uint256 proposalId, address account) view returns (bool)",
    "function getVotes(address account, uint256 timepoint) view returns (uint256)",
    "function proposalVotes(uint256 proposalId) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
    // Actions
    "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)",
    "function proposeWithMetadata(string title, string category, bool isAIGenerated, address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)",
    "function castVote(uint256 proposalId, uint8 support) returns (uint256)",
    "function castVoteWithReason(uint256 proposalId, uint8 support, string reason) returns (uint256)",
    "function queue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)",
    "function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)",
    // Custom getters
    "function getProposalCount() view returns (uint256)",
    "function getProposalIdByIndex(uint256 index) view returns (uint256)",
    "function getProposalMetadata(uint256 proposalId) view returns (string title, string category, uint256 createdAt, bool isAIGenerated)",
    // Events
    "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)",
    "event ProposalCreatedWithDescription(uint256 indexed proposalId, address indexed proposer, string description, uint256 startTime, uint256 endTime)",
    "event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)",
    "event ProposalQueued(uint256 proposalId, uint256 eta)",
    "event ProposalExecuted(uint256 proposalId)",
] as const;

export const TREASURY_ABI = [
    // TimelockController basics
    "function getMinDelay() view returns (uint256)",
    // Custom Treasury functions
    "function donate(string message) payable",
    "function allocateFunds(address recipient, uint256 amount, string purpose, uint256 proposalId)",
    "function getTreasuryBalance() view returns (uint256)",
    "function getDonationCount() view returns (uint256)",
    "function getDonation(uint256 index) view returns (address donor, uint256 amount, string message, uint256 timestamp)",
    "function getAllocationCount() view returns (uint256)",
    "function getAllocation(uint256 index) view returns (address recipient, uint256 amount, string purpose, uint256 timestamp, uint256 proposalId)",
    "function getTreasuryStats() view returns (uint256 balance, uint256 totalReceived, uint256 totalAllocated, uint256 donationCount, uint256 allocationCount)",
    "function totalDonationsReceived() view returns (uint256)",
    "function totalFundsAllocated() view returns (uint256)",
    // Events
    "event DonationReceived(address indexed donor, uint256 amount, string message)",
    "event FundsAllocated(address indexed recipient, uint256 amount, string purpose)",
] as const;

// Contract addresses (will be populated after deployment)
export const CONTRACT_ADDRESSES = {
    token: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "",
    governor: process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS || "",
    treasury: process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "",
};

// Proposal states enum matching the Governor contract
export enum ProposalState {
    Pending = 0,
    Active = 1,
    Canceled = 2,
    Defeated = 3,
    Succeeded = 4,
    Queued = 5,
    Expired = 6,
    Executed = 7,
}

// Vote support types
export enum VoteType {
    Against = 0,
    For = 1,
    Abstain = 2,
}

// Helper to get proposal state label
export function getProposalStateLabel(state: ProposalState): string {
    const labels: Record<ProposalState, string> = {
        [ProposalState.Pending]: "Pending",
        [ProposalState.Active]: "Active",
        [ProposalState.Canceled]: "Canceled",
        [ProposalState.Defeated]: "Defeated",
        [ProposalState.Succeeded]: "Succeeded",
        [ProposalState.Queued]: "Queued",
        [ProposalState.Expired]: "Expired",
        [ProposalState.Executed]: "Executed",
    };
    return labels[state] || "Unknown";
}

// Helper to get state badge class
export function getProposalStateBadgeClass(state: ProposalState): string {
    switch (state) {
        case ProposalState.Active:
            return "badge-active";
        case ProposalState.Succeeded:
        case ProposalState.Queued:
        case ProposalState.Executed:
            return "badge-passed";
        case ProposalState.Defeated:
        case ProposalState.Canceled:
        case ProposalState.Expired:
            return "badge-failed";
        default:
            return "badge-pending";
    }
}
