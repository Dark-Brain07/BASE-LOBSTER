"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import StatsCard from "@/components/StatsCard";
import { formatEther, parseEther } from "viem";
import { baseSepolia } from "wagmi/chains";

// Treasury address from deployment
const TREASURY_ADDRESS = "0x218bB0170B22020049d4760ff389F253523AC8d8" as `0x${string}`;

// Treasury ABI - only the functions we need
const TREASURY_ABI = [
    {
        "inputs": [],
        "name": "getTreasuryStats",
        "outputs": [
            { "name": "balance", "type": "uint256" },
            { "name": "totalReceived", "type": "uint256" },
            { "name": "totalAllocated", "type": "uint256" },
            { "name": "donationCount", "type": "uint256" },
            { "name": "allocationCount", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "message", "type": "string" }],
        "name": "donate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTreasuryBalance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export default function TreasuryPage() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [donationAmount, setDonationAmount] = useState("");
    const [donationMessage, setDonationMessage] = useState("");

    const isCorrectNetwork = chainId === baseSepolia.id;

    // Read treasury stats
    const { data: treasuryStats, refetch: refetchStats, isError, error } = useReadContract({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "getTreasuryStats",
        chainId: baseSepolia.id,
        query: {
            enabled: isCorrectNetwork,
        },
    });

    const { data: donateHash, writeContract: donate, isPending: isDonating } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: donateSuccess } = useWaitForTransactionReceipt({ hash: donateHash });

    useEffect(() => {
        if (donateSuccess) {
            setDonationAmount("");
            setDonationMessage("");
            refetchStats();
        }
    }, [donateSuccess, refetchStats]);

    const handleDonate = () => {
        if (!donationAmount) return;
        donate({
            address: TREASURY_ADDRESS,
            abi: TREASURY_ABI,
            functionName: "donate",
            args: [donationMessage || "Anonymous donation"],
            value: parseEther(donationAmount),
        });
    };

    const formatNum = (v: bigint | undefined) => v ? Number(formatEther(v)).toFixed(4) : "0";

    // Parse treasury stats array
    const balance = treasuryStats ? treasuryStats[0] : BigInt(0);
    const totalReceived = treasuryStats ? treasuryStats[1] : BigInt(0);
    const totalAllocated = treasuryStats ? treasuryStats[2] : BigInt(0);

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Network Warning */}
                {!isCorrectNetwork && (
                    <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 rounded-xl text-yellow-800 dark:text-yellow-200">
                        ⚠️ Please switch to <strong>Base Sepolia</strong> network to view treasury and donate.
                    </div>
                )}

                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">💰 Community Treasury</h1>
                    <p className="text-gray-600 dark:text-gray-400">Transparent fund management through governance</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard title="Current Balance" value={formatNum(balance)} subtitle="ETH" icon="💎" />
                    <StatsCard title="Total Received" value={formatNum(totalReceived)} subtitle="ETH" icon="📥" />
                    <StatsCard title="Total Allocated" value={formatNum(totalAllocated)} subtitle="ETH" icon="📤" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">🎁 Donate to Treasury</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Support the BASE LOBSTER community by donating ETH.</p>
                        {isConnected ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Amount (ETH)</label>
                                    <input type="number" step="0.001" min="0" placeholder="0.01" value={donationAmount}
                                        onChange={(e) => setDonationAmount(e.target.value)} className="input" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Message (optional)</label>
                                    <input type="text" placeholder="Leave a message" value={donationMessage}
                                        onChange={(e) => setDonationMessage(e.target.value)} className="input" />
                                </div>
                                <button onClick={handleDonate} disabled={isDonating || isConfirming || !donationAmount || !isCorrectNetwork} className="w-full btn-primary">
                                    {isDonating || isConfirming ? "Processing..." : `Donate ${donationAmount || "0"} ETH`}
                                </button>
                                {donateSuccess && <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl">✓ Thank you! 🦞</div>}
                            </div>
                        ) : (
                            <div className="text-center py-4"><p className="mb-4">Connect wallet to donate</p><ConnectButton /></div>
                        )}
                    </div>

                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">📋 How Treasury Works</h2>
                        <div className="space-y-4 text-gray-600 dark:text-gray-400">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 font-bold">1</div>
                                <div><h3 className="font-semibold text-gray-800 dark:text-white">Donations</h3><p className="text-sm">Anyone can donate ETH. Recorded on-chain.</p></div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 font-bold">2</div>
                                <div><h3 className="font-semibold text-gray-800 dark:text-white">Proposals</h3><p className="text-sm">Create proposals to allocate funds.</p></div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 font-bold">3</div>
                                <div><h3 className="font-semibold text-gray-800 dark:text-white">Voting</h3><p className="text-sm">$BLSTR holders vote. 10% quorum required.</p></div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 font-bold">4</div>
                                <div><h3 className="font-semibold text-gray-800 dark:text-white">Execution</h3><p className="text-sm">Passed proposals execute after 1-day delay.</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
