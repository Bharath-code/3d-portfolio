import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#050816",
        surface: "#0F172A",
        primary: "#6366F1",
        secondary: "#22D3EE",
        accent: "#F97316",
        muted: "#94A3B8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 30px rgba(99,102,241,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
