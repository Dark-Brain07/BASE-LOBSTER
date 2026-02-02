"use client";

import { ProposalState, getProposalStateLabel, getProposalStateBadgeClass } from "@/lib/contracts";

interface ProposalCardProps {
    id: string;
    title: string;
    description: string;
    category: string;
    state: ProposalState;
    forVotes: bigint;
    againstVotes: bigint;
    abstainVotes: bigint;
    deadline: number;
    proposer: string;
    isAIGenerated?: boolean;
    onVote?: (proposalId: string, support: number) => void;
    hasVoted?: boolean;
}

export default function ProposalCard({
    id,
    title,
    description,
    category,
    state,
    forVotes,
    againstVotes,
    abstainVotes,
    deadline,
    proposer,
    isAIGenerated,
    onVote,
    hasVoted,
}: ProposalCardProps) {
    const totalVotes = forVotes + againstVotes + abstainVotes;
    const forPercentage = totalVotes > 0n ? Number((forVotes * 100n) / totalVotes) : 0;
    const againstPercentage = totalVotes > 0n ? Number((againstVotes * 100n) / totalVotes) : 0;

    const formatVotes = (votes: bigint) => {
        const num = Number(votes) / 1e18;
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    const timeRemaining = () => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = deadline - now;
        if (remaining <= 0) return "Ended";
        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        if (days > 0) return `${days}d ${hours}h left`;
        const minutes = Math.floor((remaining % 3600) / 60);
        return `${hours}h ${minutes}m left`;
    };

    const truncateAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const getCategoryEmoji = (cat: string) => {
        const emojis: Record<string, string> = {
            charity_donation: "💝",
            community_event: "🎉",
            feature_request: "⚡",
            partnership_proposal: "🤝",
            governance_update: "📋",
            treasury_allocation: "💰",
        };
        return emojis[cat] || "📌";
    };

    return (
        <div className="card">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryEmoji(category)}</span>
                    <span className={`badge ${getProposalStateBadgeClass(state)}`}>
                        {getProposalStateLabel(state)}
                    </span>
                    {isAIGenerated && (
                        <span className="badge bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            🤖 AI Generated
                        </span>
                    )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {timeRemaining()}
                </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                {title || `Proposal #${id.slice(0, 8)}...`}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {description.slice(0, 200)}
                {description.length > 200 && "..."}
            </p>

            {/* Vote Progress */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-green-500 font-medium">
                        For: {formatVotes(forVotes)} ({forPercentage}%)
                    </span>
                    <span className="text-red-500 font-medium">
                        Against: {formatVotes(againstVotes)} ({againstPercentage}%)
                    </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex">
                    <div
                        className="bg-gradient-to-r from-green-400 to-green-500 h-full transition-all duration-500"
                        style={{ width: `${forPercentage}%` }}
                    />
                    <div
                        className="bg-gradient-to-r from-red-400 to-red-500 h-full transition-all duration-500"
                        style={{ width: `${againstPercentage}%` }}
                    />
                </div>
                <div className="text-center text-xs text-gray-500 mt-1">
                    Total: {formatVotes(totalVotes)} votes
                </div>
            </div>

            {/* Proposer */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Proposed by: <span className="font-mono">{truncateAddress(proposer)}</span>
            </div>

            {/* Vote Buttons */}
            {state === ProposalState.Active && onVote && !hasVoted && (
                <div className="flex gap-3">
                    <button
                        onClick={() => onVote(id, 1)}
                        className="flex-1 vote-for"
                    >
                        ✓ Vote For
                    </button>
                    <button
                        onClick={() => onVote(id, 0)}
                        className="flex-1 vote-against"
                    >
                        ✗ Vote Against
                    </button>
                    <button
                        onClick={() => onVote(id, 2)}
                        className="vote-abstain px-4"
                    >
                        —
                    </button>
                </div>
            )}

            {hasVoted && (
                <div className="text-center py-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <span className="text-gray-600 dark:text-gray-400">✓ You have voted</span>
                </div>
            )}
        </div>
    );
}
