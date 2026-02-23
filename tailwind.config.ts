import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4ECDC4",
          dark: "#26A69A",
          light: "#A8E6CF",
          lighter: "#E0F7FA",
        },
        mint: {
          50: "#F0FFF4",
          100: "#E0F7EA",
          200: "#A8E6CF",
          300: "#6DD5C0",
          400: "#4ECDC4",
          500: "#26A69A",
          600: "#1E8C82",
          700: "#16736B",
          800: "#0E5953",
          900: "#06403C",
        },
        accent: "#FF6B6B",
        surface: "#FFFFFF",
        background: "#F0FFF4",
        foreground: "#1A1A2E",
        muted: "#6B7280",
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ['"Noto Sans Thai"', "Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 2px 15px rgba(0, 0, 0, 0.05)",
        card: "0 4px 20px rgba(0, 0, 0, 0.08)",
        float: "0 8px 30px rgba(78, 205, 196, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
