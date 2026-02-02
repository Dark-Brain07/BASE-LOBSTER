"use client";

import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="text-8xl mb-4 lobster-float">🦞</div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">About BASE LOBSTER</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        AI-Powered, Halal-Compliant Governance on Base
                    </p>
                </div>

                {/* OpenClaw Section */}
                <section className="card mb-8">
                    <h2 className="text-2xl font-bold mb-4">🏆 OpenClaw Builder Quest</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        BASE LOBSTER was built for the OpenClaw Builder Quest, a competition to create
                        innovative applications on Base blockchain. Our project demonstrates advanced
                        onchain primitives with a focus on ethical governance.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-center">
                            <div className="text-2xl mb-2">🔗</div>
                            <h3 className="font-bold">Onchain Primitives</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">ERC20, Governor, Treasury</p>
                        </div>
                        <div className="p-4 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl text-center">
                            <div className="text-2xl mb-2">🤖</div>
                            <h3 className="font-bold">AI Integration</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Gemini-powered proposals</p>
                        </div>
                        <div className="p-4 bg-accent-50 dark:bg-accent-900/30 rounded-xl text-center">
                            <div className="text-2xl mb-2">☪️</div>
                            <h3 className="font-bold">Halal-Compliant</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">No gambling mechanics</p>
                        </div>
                    </div>
                </section>

                {/* Halal Approach */}
                <section className="card mb-8">
                    <h2 className="text-2xl font-bold mb-4">☪️ Halal-Compliant Design</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        BASE LOBSTER is designed with ethical principles in mind. Our governance token
                        has NO gambling or speculation mechanics:
                    </p>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Fixed supply - no inflationary mechanisms</li>
                        <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Pure governance utility - voting power only</li>
                        <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Transparent treasury - all funds tracked on-chain</li>
                        <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Community-focused - charity and event proposals</li>
                        <li className="flex items-center gap-2"><span className="text-red-500">✗</span> No staking rewards or yield farming</li>
                        <li className="flex items-center gap-2"><span className="text-red-500">✗</span> No lottery or random distribution</li>
                        <li className="flex items-center gap-2"><span className="text-red-500">✗</span> No price speculation features</li>
                    </ul>
                </section>

                {/* Tokenomics */}
                <section className="card mb-8">
                    <h2 className="text-2xl font-bold mb-4">📊 Tokenomics</h2>
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <span>Total Supply</span>
                            <span className="font-bold">1,000,000 BLSTR</span>
                        </div>
                        <div className="h-4 rounded-full overflow-hidden flex">
                            <div className="w-1/2 bg-primary-500" title="Treasury 50%"></div>
                            <div className="w-[30%] bg-secondary-500" title="Community 30%"></div>
                            <div className="w-1/5 bg-accent-500" title="Team 20%"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div><div className="text-2xl font-bold text-primary-500">50%</div><div className="text-sm">Treasury</div></div>
                        <div><div className="text-2xl font-bold text-secondary-500">30%</div><div className="text-sm">Community</div></div>
                        <div><div className="text-2xl font-bold text-accent-500">20%</div><div className="text-sm">Team</div></div>
                    </div>
                </section>

                {/* Governance */}
                <section className="card mb-8">
                    <h2 className="text-2xl font-bold mb-4">🗳️ Governance Parameters</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="text-2xl font-bold text-primary-500">1 day</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Voting Delay</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="text-2xl font-bold text-primary-500">3 days</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Voting Period</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="text-2xl font-bold text-primary-500">10%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Quorum</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="text-2xl font-bold text-primary-500">1 day</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Execution Delay</div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center">
                    <Link href="/governance" className="btn-primary inline-block text-lg px-8 py-4">
                        🗳️ Start Participating
                    </Link>
                </div>
            </div>
        </div>
    );
}
