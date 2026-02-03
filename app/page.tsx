"use client";

import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import StatsCard from "@/components/StatsCard";
import FaucetButton from "@/components/FaucetButton";
import { TOKEN_ABI, GOVERNOR_ABI, TREASURY_ABI, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { formatEther } from "viem";

export default function HomePage() {
    const { isConnected } = useAccount();

    // Read total supply
    const { data: totalSupply } = useReadContract({
        address: CONTRACT_ADDRESSES.token as `0x${string}`,
        abi: TOKEN_ABI,
        functionName: "totalSupply",
    });

    // Read proposal count
    const { data: proposalCount } = useReadContract({
        address: CONTRACT_ADDRESSES.governor as `0x${string}`,
        abi: GOVERNOR_ABI,
        functionName: "getProposalCount",
    });

    // Read treasury balance
    const { data: treasuryBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.treasury as `0x${string}`,
        abi: TREASURY_ABI,
        functionName: "getTreasuryBalance",
    });

    const formatNumber = (value: bigint | undefined, decimals = 18) => {
        if (!value) return "0";
        const num = Number(formatEther(value));
        if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
        return num.toFixed(2);
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="ocean-bg text-white py-20 px-4 relative overflow-hidden">
                {/* Animated Lobsters */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 text-6xl opacity-20 lobster-float" style={{ animationDelay: "0s" }}>🦞</div>
                    <div className="absolute top-20 right-20 text-4xl opacity-20 lobster-float" style={{ animationDelay: "1s" }}>🦞</div>
                    <div className="absolute bottom-20 left-1/4 text-5xl opacity-20 lobster-float" style={{ animationDelay: "2s" }}>🦞</div>
                    <div className="absolute bottom-10 right-1/3 text-7xl opacity-20 lobster-float" style={{ animationDelay: "0.5s" }}>🦞</div>
                </div>

                <div className="container mx-auto text-center relative z-10">
                    <img src="/hero-logo.png" alt="Base Lobster" className="w-48 h-48 mx-auto mb-6 logo-spin object-contain" />
                    <h1 className="text-5xl md:text-7xl font-bold mb-4">
                        BASE LOBSTER
                    </h1>
                    <p className="text-xl md:text-2xl mb-2 opacity-90">
                        <span className="font-mono">$BLSTR</span>
                    </p>
                    <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-80">
                        AI-Powered, Halal-Compliant Governance on Base Blockchain.
                        Join the lobster community and shape our collective future.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {isConnected ? (
                            <>
                                <Link href="/governance" className="btn-primary text-lg px-8 py-4">
                                    View Proposals
                                </Link>
                                <Link href="/dashboard" className="btn-secondary bg-white/10 border-white text-white hover:bg-white hover:text-primary-500 text-lg px-8 py-4">
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <ConnectButton label="🔗 Connect Wallet to Start" />
                                <p className="text-sm opacity-70">Connect your wallet to participate in governance</p>
                            </div>
                        )}
                    </div>

                    {/* Faucet Button */}
                    <div className="mt-8">
                        <FaucetButton />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 -mt-10 relative z-20">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <StatsCard
                            title="Total Supply"
                            value={totalSupply ? formatNumber(totalSupply) : "1M"}
                            subtitle="BLSTR Tokens"
                            imageIcon="/hero-logo.png"
                        />
                        <StatsCard
                            title="Active Proposals"
                            value={proposalCount?.toString() || "0"}
                            subtitle="Community Decisions"
                            imageIcon="/proposals-icon.png"
                        />
                        <StatsCard
                            title="Treasury"
                            value={typeof treasuryBalance === 'bigint' ? `${formatNumber(treasuryBalance)}` : "0"}
                            subtitle="ETH"
                            imageIcon="/treasury-icon.png"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        Why BASE LOBSTER? 🦞
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Feature 1 */}
                        <div className="card text-center">
                            <img src="/ai-icon.png" alt="AI Governance" className="w-48 h-48 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">AI-Powered Governance</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Our Gemini AI bot generates thoughtful community proposals every 6 hours,
                                focusing on charity, events, and growth.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card text-center">
                            <img src="/halal-icon.png" alt="Halal Compliant" className="w-56 h-56 mx-auto mb-4 object-contain" />
                            <h3 className="text-xl font-bold mb-2">Halal-Compliant</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                No gambling, no speculation. Pure community governance for ethical
                                decision-making on the blockchain.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card text-center">
                            <img src="/base-icon.png" alt="Built on Base" className="w-48 h-48 mx-auto mb-4 object-contain" />
                            <h3 className="text-xl font-bold mb-2">Built on Base</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Leveraging Base's low fees and fast transactions for accessible
                                governance that everyone can participate in.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        How Governance Works
                    </h2>

                    <div className="space-y-8">
                        {/* Step 1 */}
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-xl">
                                1
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Hold $BLSTR Tokens</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Your voting power equals your token holdings. Delegate your votes
                                    to yourself or a trusted community member.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-xl">
                                2
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Create or Vote on Proposals</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Submit proposals for community decisions or vote on existing ones.
                                    AI-generated proposals appear automatically for inspiration.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-xl">
                                3
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Watch Decisions Execute</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Proposals passing quorum (10%) are queued and executed automatically
                                    after a 1-day delay. Full transparency on-chain.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 ocean-bg text-white">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Join the Lobster Community? 🦞
                    </h2>
                    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        Connect your wallet, delegate your votes, and start participating
                        in ethical governance on Base.
                    </p>
                    {!isConnected ? (
                        <ConnectButton label="🔗 Connect Wallet" />
                    ) : (
                        <Link href="/governance" className="btn-primary bg-white text-primary-500 hover:bg-gray-100 text-lg px-8 py-4 inline-block">
                            🗳️ Start Voting
                        </Link>
                    )}
                </div>
            </section>

            {/* OpenClaw Badge */}
            <section className="py-8 px-4 bg-gray-900 text-white text-center">
                <p className="text-sm opacity-70">
                    Built for the <span className="font-bold">OpenClaw Builder Quest</span> 🏆
                </p>
            </section>
        </div>
    );
}
