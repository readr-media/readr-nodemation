import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./stores/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          300: "#f5f5f1",
          400: "#e8e7e2",
          600: "#a09d92",
          700: "#6e6b51",
          800: "#4a4842",
          900: "#2a2822",
        },
        module: {
          border: "#e8e7e2",
          placeholder: "#a09d92",
          text: "#4c463c",
          title: "#2a2822",
          muted: "#6e6b5e",
          hover: "#d4d3cc",
          heading: "#4a4842",
          iconBg: "#f5f5f1",
        },
        red: {
          100: "#FFF5F2",
          300: "#FFDDD4",
          500: "#FF6B4A",
          700: "#E64A2E",
          900: "#B33820",
        },
        purple: {
          100: "#F5F3FF",
          300: "#E9D5FF",
          500: "#9333EA",
          700: "#7E22CE",
          900: "#6B21A8",
        },
        green: {
          100: "#F0FDF9",
          300: "#C7F5E8",
          500: "#00967D",
          700: "#007A66",
          900: "#006654",
        },
        blue: {
          100: "#F2F7FC",
          300: "#D4E6F7",
          500: "#4A90E2",
          700: "#2E7BD4",
          900: "#1E5FA8",
        },
        yellow: {
          100: "#FEF3C7",
          300: "#FCD34D",
          500: "#FFB020",
          700: "#D97706",
          900: "#B45309",
        },
      },
      boxShadow: {
        2: [
          "0px 8px 12px -2px rgba(0, 0, 0, 0.05)",
          "0px 4px 12px 0px rgba(0, 0, 0, 0.05)",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
