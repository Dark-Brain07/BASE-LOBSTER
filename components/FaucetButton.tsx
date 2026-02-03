"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { formatEther } from "viem";

// Faucet contract address
const FAUCET_ADDRESS = "0xC56661e2eec24AbD3A08803078c7EB73098EC552" as `0x${string}`;

// Faucet ABI
const FAUCET_ABI = [
    {
        "inputs": [],
        "name": "claim",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "name": "_address", "type": "address" }],
        "name": "canClaim",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "_address", "type": "address" }],
        "name": "getTimeUntilNextClaim",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getRemainingBalance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "CLAIM_AMOUNT",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export default function FaucetButton() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [countdown, setCountdown] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const isCorrectNetwork = chainId === baseSepolia.id;

    // Read if user can claim
    const { data: canClaimData, refetch: refetchCanClaim } = useReadContract({
        address: FAUCET_ADDRESS,
        abi: FAUCET_ABI,
        functionName: "canClaim",
        args: address ? [address] : undefined,
        chainId: baseSepolia.id,
        query: { enabled: !!address && isCorrectNetwork },
    });

    // Read time until next claim
    const { data: timeUntilClaim, refetch: refetchTime } = useReadContract({
        address: FAUCET_ADDRESS,
        abi: FAUCET_ABI,
        functionName: "getTimeUntilNextClaim",
        args: address ? [address] : undefined,
        chainId: baseSepolia.id,
        query: { enabled: !!address && isCorrectNetwork },
    });

    // Read remaining faucet balance
    const { data: remainingBalance } = useReadContract({
        address: FAUCET_ADDRESS,
        abi: FAUCET_ABI,
        functionName: "getRemainingBalance",
        chainId: baseSepolia.id,
        query: { enabled: isCorrectNetwork },
    });

    // Claim function
    const { data: claimHash, writeContract: claimTokens, isPending: isClaiming } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

    // Format countdown
    useEffect(() => {
        if (!timeUntilClaim || timeUntilClaim === BigInt(0)) {
            setCountdown("");
            return;
        }

        const updateCountdown = () => {
            const seconds = Number(timeUntilClaim);
            if (seconds <= 0) {
                setCountdown("");
                refetchCanClaim();
                refetchTime();
                return;
            }

            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            setCountdown(`${hours}h ${minutes}m ${secs}s`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [timeUntilClaim, refetchCanClaim, refetchTime]);

    // Handle claim success
    useEffect(() => {
        if (claimSuccess) {
            setShowSuccess(true);
            refetchCanClaim();
            refetchTime();
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, [claimSuccess, refetchCanClaim, refetchTime]);

    const handleClaim = () => {
        claimTokens({
            address: FAUCET_ADDRESS,
            abi: FAUCET_ABI,
            functionName: "claim",
        });
    };

    const formatBalance = (value: bigint | undefined) => {
        if (!value) return "0";
        const num = Number(formatEther(value));
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    if (!isConnected) {
        return (
            <div className="glass rounded-2xl p-6 text-center max-w-sm mx-auto">
                <img src="/faucet-icon.png" alt="Faucet" className="w-12 h-12 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Token Faucet</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Connect wallet to claim free BLSTR
                </p>
                <div className="text-xs text-gray-500">
                    {typeof remainingBalance === 'bigint' && `${formatBalance(remainingBalance)} BLSTR remaining`}
                </div>
            </div>
        );
    }

    if (!isCorrectNetwork) {
        return (
            <div className="glass rounded-2xl p-6 text-center max-w-sm mx-auto">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="font-bold text-lg mb-2">Wrong Network</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Switch to Base Sepolia to use faucet
                </p>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl p-6 text-center max-w-sm mx-auto relative overflow-hidden">
            {/* Background animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 animate-pulse"></div>

            <div className="relative z-10">
                <img src="/faucet-icon.png" alt="Faucet" className="w-12 h-12 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Token Faucet</h3>

                {showSuccess ? (
                    <div className="py-4">
                        <div className="text-3xl mb-2">🎉</div>
                        <p className="text-green-500 font-bold">+1 BLSTR Claimed!</p>
                    </div>
                ) : canClaimData ? (
                    <>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Claim 1 BLSTR every 24 hours
                        </p>
                        <button
                            onClick={handleClaim}
                            disabled={isClaiming || isConfirming}
                            className="btn-primary w-full py-3 text-lg font-bold disabled:opacity-50"
                        >
                            {isClaiming || isConfirming ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">🦞</span> Claiming...
                                </span>
                            ) : (
                                "🎁 Claim 1 BLSTR"
                            )}
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Next claim available in:
                        </p>
                        <div className="text-2xl font-mono font-bold text-primary-500 mb-4">
                            {countdown || "Loading..."}
                        </div>
                        <button
                            disabled
                            className="btn-secondary w-full py-3 opacity-50 cursor-not-allowed"
                        >
                            ⏰ Come back later
                        </button>
                    </>
                )}

                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Faucet Balance: {typeof remainingBalance === 'bigint' ? formatBalance(remainingBalance) : "..."} BLSTR
                </div>
            </div>
        </div>
    );
}
