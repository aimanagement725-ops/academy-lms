import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F7F5",
        surface: "#FFFFFF",
        ink: "#1C1D21",
        muted: "#6B6D76",
        line: "#E6E6E2",
        accent: {
          DEFAULT: "#2F5D50", // deep evergreen -- distinct from the generic
          soft: "#E7EFEC",
        },
        signal: {
          amber: "#B8863B",
          rose: "#B5473F",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,29,33,0.04), 0 8px 24px rgba(28,29,33,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
