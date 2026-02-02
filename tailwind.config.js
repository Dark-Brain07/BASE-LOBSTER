/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#e6f0ff",
                    100: "#b3d1ff",
                    200: "#80b3ff",
                    300: "#4d94ff",
                    400: "#1a75ff",
                    500: "#0052FF", // Base brand blue
                    600: "#0047e6",
                    700: "#003cb3",
                    800: "#003180",
                    900: "#00264d",
                },
                secondary: {
                    50: "#f3eef8",
                    100: "#e0d4ed",
                    200: "#c9b5e0",
                    300: "#b196d3",
                    400: "#9a77c6",
                    500: "#764BA2", // Deep purple
                    600: "#6a4392",
                    700: "#5a3a7d",
                    800: "#4a3068",
                    900: "#3a2653",
                },
                accent: {
                    50: "#fde8ea",
                    100: "#f9c5ca",
                    200: "#f4a1a9",
                    300: "#ef7d88",
                    400: "#eb5a67",
                    500: "#E63946", // Lobster red
                    600: "#cf333f",
                    700: "#b32d37",
                    800: "#96272f",
                    900: "#7a2027",
                },
                ocean: {
                    50: "#e6f7ff",
                    100: "#b3e7ff",
                    200: "#80d7ff",
                    300: "#4dc7ff",
                    400: "#1ab7ff",
                    500: "#00a7e6",
                    600: "#0096cc",
                    700: "#0085b3",
                    800: "#007399",
                    900: "#006280",
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "ocean-gradient": "linear-gradient(135deg, #0052FF 0%, #764BA2 100%)",
                "lobster-gradient": "linear-gradient(135deg, #E63946 0%, #764BA2 100%)",
            },
            animation: {
                "float": "float 6s ease-in-out infinite",
                "wave": "wave 3s ease-in-out infinite",
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                wave: {
                    "0%, 100%": { transform: "rotate(0deg)" },
                    "25%": { transform: "rotate(10deg)" },
                    "75%": { transform: "rotate(-10deg)" },
                },
            },
        },
    },
    plugins: [],
};
