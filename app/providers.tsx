"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect, createContext, useContext } from "react";

// Configure wagmi with RainbowKit
const config = getDefaultConfig({
    appName: "BASE LOBSTER",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
    chains: [baseSepolia, base],
    transports: {
        [baseSepolia.id]: http("https://sepolia.base.org"),
        [base.id]: http("https://mainnet.base.org"),
    },
    ssr: true,
});

// Theme context for dark mode
interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

// Custom RainbowKit theme
const customLightTheme = lightTheme({
    accentColor: "#0052FF",
    accentColorForeground: "white",
    borderRadius: "large",
    fontStack: "system",
});

const customDarkTheme = darkTheme({
    accentColor: "#0052FF",
    accentColorForeground: "white",
    borderRadius: "large",
    fontStack: "system",
});

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check for saved preference or system preference
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider theme={isDark ? customDarkTheme : customLightTheme}>
                        {children}
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </ThemeContext.Provider>
    );
}
