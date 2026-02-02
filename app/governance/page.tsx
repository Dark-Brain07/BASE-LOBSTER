"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import { baseSepolia } from "wagmi/chains";

// Contract addresses from deployment
const GOVERNOR_ADDRESS = "0xb7B0615DfD26574747a4F3f6ACf6e839C7679aCd" as `0x${string}`;
const TOKEN_ADDRESS = "0xFdf71B8b3d2F08c8728ee56fB64C283B19BeAEd8" as `0x${string}`;
const TREASURY_ADDRESS = "0x218bB0170B22020049d4760ff389F253523AC8d8" as `0x${string}`;

// Token ABI for voting power
const TOKEN_ABI = [
    {
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "getVotes",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

// Governor ABI
const GOVERNOR_ABI = [
    {
        "inputs": [],
        "name": "getProposalCount",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "index", "type": "uint256" }],
        "name": "getProposalIdByIndex",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "proposalId", "type": "uint256" }],
        "name": "getProposalMetadata",
        "outputs": [
            { "name": "title", "type": "string" },
            { "name": "category", "type": "string" },
            { "name": "createdAt", "type": "uint256" },
            { "name": "isAIGenerated", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "proposalId", "type": "uint256" }],
        "name": "state",
        "outputs": [{ "name": "", "type": "uint8" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "proposalId", "type": "uint256" }],
        "name": "proposalVotes",
        "outputs": [
            { "name": "againstVotes", "type": "uint256" },
            { "name": "forVotes", "type": "uint256" },
            { "name": "abstainVotes", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "proposalId", "type": "uint256" }],
        "name": "proposalDeadline",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "proposalId", "type": "uint256" },
            { "name": "support", "type": "uint8" }
        ],
        "name": "castVote",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "title", "type": "string" },
            { "name": "category", "type": "string" },
            { "name": "isAIGenerated", "type": "bool" },
            { "name": "targets", "type": "address[]" },
            { "name": "values", "type": "uint256[]" },
            { "name": "calldatas", "type": "bytes[]" },
            { "name": "description", "type": "string" }
        ],
        "name": "proposeWithMetadata",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// Proposal state labels
const ProposalStateLabels: Record<number, string> = {
    0: "⏳ Pending",
    1: "🟢 Active",
    2: "❌ Canceled",
    3: "👎 Defeated",
    4: "✅ Succeeded",
    5: "📋 Queued",
    6: "⌛ Expired",
    7: "🎉 Executed"
};

const ProposalStateColors: Record<number, string> = {
    0: "bg-yellow-500",
    1: "bg-green-500",
    2: "bg-red-500",
    3: "bg-red-500",
    4: "bg-blue-500",
    5: "bg-purple-500",
    6: "bg-gray-500",
    7: "bg-green-600"
};

interface ProposalData {
    id: bigint;
    title: string;
    category: string;
    createdAt: bigint;
    isAIGenerated: boolean;
    state: number;
    forVotes: bigint;
    againstVotes: bigint;
    abstainVotes: bigint;
}

export default function GovernancePage() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [proposals, setProposals] = useState<ProposalData[]>([]);
    const [isLoadingProposals, setIsLoadingProposals] = useState(true);
    const [newProposal, setNewProposal] = useState({
        title: "",
        description: "",
        category: "community_event",
    });

    const isCorrectNetwork = chainId === baseSepolia.id;

    // Read proposal count
    const { data: proposalCount, refetch: refetchCount } = useReadContract({
        address: GOVERNOR_ADDRESS,
        abi: GOVERNOR_ABI,
        functionName: "getProposalCount",
        chainId: baseSepolia.id,
        query: { enabled: isCorrectNetwork },
    });

    // Read first proposal ID (index 0)
    const { data: proposalId0 } = useReadContract({
        address: GOVERNOR_ADDRESS,
        abi: GOVERNOR_ABI,
        functionName: "getProposalIdByIndex",
        args: [BigInt(0)],
        chainId: baseSepolia.id,
        query: { enabled: isCorrectNetwork && Number(proposalCount || 0) > 0 },
    });

    // Read proposal metadata
    const { data: proposalMeta0 } = useReadContract({
        address: GOVERNOR_ADDRESS,
        abi: GOVERNOR_ABI,
        functionName: "getProposalMetadata",
        args: proposalId0 ? [proposalId0] : undefined,
        chainId: baseSepolia.id,
        query: { enabled: !!proposalId0 },
    });

    // Read proposal state
    const { data: proposalState0 } = useReadContract({
        address: GOVERNOR_ADDRESS,
        abi: GOVERNOR_ABI,
        functionName: "state",
        args: proposalId0 ? [proposalId0] : undefined,
        chainId: baseSepolia.id,
        query: { enabled: !!proposalId0 },
    });

    // Read proposal votes
    const { data: proposalVotes0 } = useReadContract({
        address: GOVERNOR_ADDRESS,
        abi: GOVERNOR_ABI,
        functionName: "proposalVotes",
        args: proposalId0 ? [proposalId0] : undefined,
        chainId: baseSepolia.id,
        query: { enabled: !!proposalId0 },
    });

    // Read user's voting power
    const { data: votingPower } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "getVotes",
        args: address ? [address] : undefined,
        chainId: baseSepolia.id,
        query: { enabled: !!address && isCorrectNetwork },
    });

    // Build proposals array when data is loaded
    useEffect(() => {
        if (proposalId0 && proposalMeta0 && proposalState0 !== undefined) {
            const proposal: ProposalData = {
                id: proposalId0,
                title: proposalMeta0[0],
                category: proposalMeta0[1],
                createdAt: proposalMeta0[2],
                isAIGenerated: proposalMeta0[3],
                state: proposalState0,
                forVotes: proposalVotes0 ? proposalVotes0[1] : BigInt(0),
                againstVotes: proposalVotes0 ? proposalVotes0[0] : BigInt(0),
                abstainVotes: proposalVotes0 ? proposalVotes0[2] : BigInt(0),
            };
            setProposals([proposal]);
            setIsLoadingProposals(false);
        } else if (proposalCount !== undefined && Number(proposalCount) === 0) {
            setProposals([]);
            setIsLoadingProposals(false);
        }
    }, [proposalId0, proposalMeta0, proposalState0, proposalVotes0, proposalCount]);

    // Create proposal
    const { data: createHash, writeContract: createProposal, isPending: isCreating } = useWriteContract();
    const { isLoading: isConfirmingCreate, isSuccess: createSuccess } = useWaitForTransactionReceipt({ hash: createHash });

    // Cast vote
    const { data: voteHash, writeContract: castVote, isPending: isVoting } = useWriteContract();
    const { isLoading: isConfirmingVote, isSuccess: voteSuccess } = useWaitForTransactionReceipt({ hash: voteHash });

    const handleCreateProposal = () => {
        if (!newProposal.title || !newProposal.description) return;

        createProposal({
            address: GOVERNOR_ADDRESS,
            abi: GOVERNOR_ABI,
            functionName: "proposeWithMetadata",
            args: [
                newProposal.title,
                newProposal.category,
                false,
                [TREASURY_ADDRESS],
                [BigInt(0)],
                ["0x" as `0x${string}`],
                newProposal.description,
            ],
        });
    };

    const handleVote = (proposalId: bigint, support: number) => {
        castVote({
            address: GOVERNOR_ADDRESS,
            abi: GOVERNOR_ABI,
            functionName: "castVote",
            args: [proposalId, support],
        });
    };

    useEffect(() => {
        if (createSuccess) {
            setShowCreateForm(false);
            setNewProposal({ title: "", description: "", category: "community_event" });
            refetchCount();
        }
    }, [createSuccess, refetchCount]);

    const formatVotes = (v: bigint | undefined) => {
        if (!v) return "0";
        const num = Number(formatEther(v));
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    const getCategoryEmoji = (category: string) => {
        const emojis: Record<string, string> = {
            charity_donation: "💝",
            community_event: "🎉",
            feature_request: "⚡",
            partnership_proposal: "🤝",
            governance_update: "📋",
            treasury_allocation: "💰"
        };
        return emojis[category] || "📄";
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-8xl mb-6">🗳️</div>
                    <h1 className="text-3xl font-bold mb-4">Governance</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Connect your wallet to view and vote on proposals
                    </p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Network Warning */}
                {!isCorrectNetwork && (
                    <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 rounded-xl text-yellow-800 dark:text-yellow-200">
                        ⚠️ Please switch to <strong>Base Sepolia</strong> network to participate in governance.
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">🗳️ Governance</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            View and vote on community proposals
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="mt-4 md:mt-0 btn-primary"
                        disabled={!isCorrectNetwork}
                    >
                        {showCreateForm ? "✕ Cancel" : "📝 Create Proposal"}
                    </button>
                </div>

                {/* Create Proposal Form */}
                {showCreateForm && (
                    <div className="card mb-8">
                        <h2 className="text-xl font-bold mb-4">Create New Proposal</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter proposal title"
                                    value={newProposal.title}
                                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    value={newProposal.category}
                                    onChange={(e) => setNewProposal({ ...newProposal, category: e.target.value })}
                                    className="input"
                                >
                                    <option value="charity_donation">💝 Charity Donation</option>
                                    <option value="community_event">🎉 Community Event</option>
                                    <option value="feature_request">⚡ Feature Request</option>
                                    <option value="partnership_proposal">🤝 Partnership</option>
                                    <option value="governance_update">📋 Governance Update</option>
                                    <option value="treasury_allocation">💰 Treasury Allocation</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    placeholder="Describe your proposal in detail..."
                                    value={newProposal.description}
                                    onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                                    className="textarea"
                                    rows={6}
                                />
                            </div>
                            <button
                                onClick={handleCreateProposal}
                                disabled={isCreating || isConfirmingCreate || !newProposal.title || !newProposal.description}
                                className="btn-primary w-full"
                            >
                                {isCreating || isConfirmingCreate ? "Creating..." : "Submit Proposal"}
                            </button>
                            {createSuccess && (
                                <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl">
                                    ✓ Proposal created successfully!
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Voting Power Banner */}
                <div className="glass rounded-xl p-4 mb-8 flex items-center justify-between">
                    <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Your Voting Power</span>
                        <div className="text-xl font-bold">
                            {formatVotes(votingPower as bigint | undefined)} BLSTR
                        </div>
                    </div>
                    <div className="text-4xl">🦞</div>
                </div>

                {/* Proposals Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                        Proposals ({proposalCount?.toString() || "0"})
                    </h2>

                    {isLoadingProposals ? (
                        <div className="card text-center py-12">
                            <div className="text-6xl lobster-float mb-4">🦞</div>
                            <p>Loading proposals...</p>
                        </div>
                    ) : proposals.length === 0 ? (
                        <div className="card text-center py-12">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold mb-2">No Proposals Yet</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Be the first to create a proposal for the community!
                            </p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="btn-primary"
                                disabled={!isCorrectNetwork}
                            >
                                📝 Create First Proposal
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {proposals.map((proposal) => (
                                <div key={proposal.id.toString()} className="card">
                                    {/* Proposal Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{getCategoryEmoji(proposal.category)}</span>
                                                <h3 className="text-xl font-bold">{proposal.title}</h3>
                                                {proposal.isAIGenerated && (
                                                    <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full">
                                                        🤖 AI Generated
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                <span className={`px-2 py-1 rounded-full text-white text-xs ${ProposalStateColors[proposal.state]}`}>
                                                    {ProposalStateLabels[proposal.state]}
                                                </span>
                                                <span>Category: {proposal.category.replace("_", " ")}</span>
                                                <span>ID: {proposal.id.toString().slice(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vote Counts */}
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="text-center p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {formatVotes(proposal.forVotes)}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">For</div>
                                        </div>
                                        <div className="text-center p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                {formatVotes(proposal.againstVotes)}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Against</div>
                                        </div>
                                        <div className="text-center p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                                            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                                {formatVotes(proposal.abstainVotes)}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Abstain</div>
                                        </div>
                                    </div>

                                    {/* Voting Buttons */}
                                    {proposal.state === 1 && ( // Active state
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleVote(proposal.id, 1)}
                                                disabled={isVoting || isConfirmingVote}
                                                className="flex-1 py-3 px-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors disabled:opacity-50"
                                            >
                                                👍 Vote For
                                            </button>
                                            <button
                                                onClick={() => handleVote(proposal.id, 0)}
                                                disabled={isVoting || isConfirmingVote}
                                                className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50"
                                            >
                                                👎 Vote Against
                                            </button>
                                            <button
                                                onClick={() => handleVote(proposal.id, 2)}
                                                disabled={isVoting || isConfirmingVote}
                                                className="flex-1 py-3 px-4 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-bold transition-colors disabled:opacity-50"
                                            >
                                                🤷 Abstain
                                            </button>
                                        </div>
                                    )}

                                    {proposal.state === 0 && (
                                        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-center">
                                            ⏳ Voting starts in 1 day (after voting delay)
                                        </div>
                                    )}

                                    {proposal.state > 1 && (
                                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
                                            Voting has ended - {ProposalStateLabels[proposal.state]}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Vote Success Message */}
                {voteSuccess && (
                    <div className="fixed bottom-4 right-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl shadow-lg">
                        ✓ Vote cast successfully!
                    </div>
                )}
            </div>
        </div>
    );
}
