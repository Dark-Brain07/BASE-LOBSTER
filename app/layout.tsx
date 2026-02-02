import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "BASE LOBSTER | AI-Powered Governance on Base",
    description: "A halal-compliant, AI-powered governance token dApp on Base blockchain. Join the lobster community and participate in ethical, transparent governance.",
    keywords: ["BASE", "LOBSTER", "governance", "DAO", "blockchain", "Base", "Ethereum", "L2", "halal", "ethical"],
    authors: [{ name: "BASE LOBSTER Team" }],
    openGraph: {
        title: "BASE LOBSTER | AI-Powered Governance on Base",
        description: "Join the lobster community! Ethical governance on Base blockchain.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "BASE LOBSTER | AI-Powered Governance on Base",
        description: "Join the lobster community! Ethical governance on Base blockchain.",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <div className="min-h-screen flex flex-col">
                        <Navigation />
                        <main className="flex-1">{children}</main>
                        <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            <div className="container mx-auto px-4">
                                <p className="flex items-center justify-center gap-2">
                                    <span className="lobster-float text-2xl">🦞</span>
                                    <span>BASE LOBSTER © 2024 | Built for OpenClaw Builder Quest</span>
                                    <span className="lobster-float text-2xl">🦞</span>
                                </p>
                                <p className="mt-2">
                                    Halal-compliant governance on{" "}
                                    <a
                                        href="https://base.org"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-500 hover:underline"
                                    >
                                        Base
                                    </a>
                                </p>
                            </div>
                        </footer>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
