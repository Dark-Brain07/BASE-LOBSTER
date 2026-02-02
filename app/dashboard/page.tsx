"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import StatsCard from "@/components/StatsCard";
import { TOKEN_ABI, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { formatEther } from "viem";
import { useState, useEffect } from "react";
import { baseSepolia } from "wagmi/chains";

// Token address from deployment
const TOKEN_ADDRESS = "0xFdf71B8b3d2F08c8728ee56fB64C283B19BeAEd8" as `0x${string}`;

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [delegateAddress, setDelegateAddress] = useState("");

    const isCorrectNetwork = chainId === baseSepolia.id;

    // Read user's token balance
    const { data: balance, refetch: refetchBalance, isError: balanceError } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        chainId: baseSepolia.id,
        query: {
            enabled: !!address && isCorrectNetwork,
        },
    });

    // Read user's voting power
    const { data: votingPower, refetch: refetchVotes } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "getVotes",
        args: address ? [address] : undefined,
        chainId: baseSepolia.id,
        query: {
            enabled: !!address && isCorrectNetwork,
        },
    });

    // Read current delegate
    const { data: currentDelegate, refetch: refetchDelegate } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "delegates",
        args: address ? [address] : undefined,
        chainId: baseSepolia.id,
        query: {
            enabled: !!address && isCorrectNetwork,
        },
    });

    // Read total supply
    const { data: totalSupply } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "totalSupply",
        chainId: baseSepolia.id,
        query: {
            enabled: isCorrectNetwork,
        },
    });

    // Delegate function
    const { data: delegateHash, writeContract: delegate, isPending: isDelegating } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: delegateSuccess } = useWaitForTransactionReceipt({
        hash: delegateHash,
    });

    useEffect(() => {
        if (delegateSuccess) {
            refetchBalance();
            refetchVotes();
            refetchDelegate();
        }
    }, [delegateSuccess, refetchBalance, refetchVotes, refetchDelegate]);

    const handleDelegate = () => {
        if (!delegateAddress && !address) return;

        delegate({
            address: TOKEN_ADDRESS,
            abi: TOKEN_ABI,
            functionName: "delegate",
            args: [delegateAddress || address],
        });
    };

    const handleSelfDelegate = () => {
        if (!address) return;

        delegate({
            address: TOKEN_ADDRESS,
            abi: TOKEN_ABI,
            functionName: "delegate",
            args: [address],
        });
    };

    const formatNumber = (value: bigint | undefined) => {
        if (!value) return "0";
        const num = Number(formatEther(value));
        if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
        return num.toFixed(2);
    };

    const truncateAddress = (addr: string | undefined) => {
        if (!addr || addr === "0x0000000000000000000000000000000000000000") return "None";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const votingPowerPercentage = () => {
        if (!votingPower || !totalSupply) return "0";
        const percentage = (Number(votingPower) / Number(totalSupply)) * 100;
        return percentage.toFixed(4);
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-8xl mb-6 lobster-float">🦞</div>
                    <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Connect your wallet to view your $BLSTR balance and voting power
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
                        ⚠️ Please switch to <strong>Base Sepolia</strong> network to view your balance and voting power.
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        🦞 Your Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your $BLSTR tokens and voting power
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Your Balance"
                        value={formatNumber(balance as bigint | undefined)}
                        subtitle="$BLSTR"
                        icon="🪙"
                    />
                    <StatsCard
                        title="Voting Power"
                        value={formatNumber(votingPower as bigint | undefined)}
                        subtitle={`${votingPowerPercentage()}% of total`}
                        icon="🗳️"
                    />
                    <StatsCard
                        title="Delegate"
                        value={truncateAddress(currentDelegate as string)}
                        subtitle={currentDelegate === address ? "Self-delegated" : "Delegated"}
                        icon="👤"
                    />
                </div>

                {/* Delegation Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Delegate Card */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">🗳️ Delegate Your Votes</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Delegating your votes allows you to participate in governance.
                            You can delegate to yourself or to a trusted community member.
                        </p>

                        {/* Self Delegate Button */}
                        <button
                            onClick={handleSelfDelegate}
                            disabled={isDelegating || isConfirming || currentDelegate === address}
                            className={`w-full mb-4 btn-primary ${currentDelegate === address ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {isDelegating || isConfirming ? (
                                "Processing..."
                            ) : currentDelegate === address ? (
                                "✓ Already Self-Delegated"
                            ) : (
                                "Delegate to Yourself"
                            )}
                        </button>

                        {/* Or Delegate to Someone Else */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-white dark:bg-gray-800 text-sm text-gray-500">
                                    or delegate to someone else
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="0x... address"
                                value={delegateAddress}
                                onChange={(e) => setDelegateAddress(e.target.value)}
                                className="input font-mono"
                            />
                            <button
                                onClick={handleDelegate}
                                disabled={isDelegating || isConfirming || !delegateAddress}
                                className="w-full btn-secondary"
                            >
                                {isDelegating || isConfirming ? "Processing..." : "Delegate to Address"}
                            </button>
                        </div>

                        {delegateSuccess && (
                            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl">
                                ✓ Delegation successful! Your voting power has been updated.
                            </div>
                        )}
                    </div>

                    {/* Info Card */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">📚 Understanding Voting Power</h2>

                        <div className="space-y-4 text-gray-600 dark:text-gray-400">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🪙</span>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Token Balance</h3>
                                    <p className="text-sm">The number of $BLSTR tokens you hold in your wallet.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🗳️</span>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Voting Power</h3>
                                    <p className="text-sm">Your actual voting weight in governance. Only activated after delegation.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="text-2xl">👤</span>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Delegation</h3>
                                    <p className="text-sm">You must delegate your votes (even to yourself) to participate. Others can also delegate their votes to you!</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📊</span>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Quorum</h3>
                                    <p className="text-sm">10% of total supply must vote for a proposal to pass. That's 100,000 BLSTR votes minimum.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Token Distribution Info */}
                <div className="card mt-8">
                    <h2 className="text-xl font-bold mb-4">📊 Token Distribution</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
                            <div className="text-3xl font-bold text-primary-500">50%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Treasury</div>
                            <div className="text-xs text-gray-500">500,000 BLSTR</div>
                        </div>
                        <div className="p-4 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl">
                            <div className="text-3xl font-bold text-secondary-500">30%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Community</div>
                            <div className="text-xs text-gray-500">300,000 BLSTR</div>
                        </div>
                        <div className="p-4 bg-accent-50 dark:bg-accent-900/30 rounded-xl">
                            <div className="text-3xl font-bold text-accent-500">20%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Team</div>
                            <div className="text-xs text-gray-500">200,000 BLSTR</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
