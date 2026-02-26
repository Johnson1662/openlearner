import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: "#6366F1",
          secondary: "#818CF8",
          cta: "#10B981",
          ctaHover: "#059669",
          accent: "#F59E0B",
          yellow: "#FBBF24",
          blue: "#3B82F6",
          purple: "#8B5CF6",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
        surface: {
          bg: "#F5F3FF",
          bgSecondary: "#EDE9FE",
          card: "rgba(255, 255, 255, 0.8)",
          cardHover: "rgba(255, 255, 255, 0.95)",
          border: "rgba(255, 255, 255, 0.3)",
          glass: "rgba(255, 255, 255, 0.7)",
        },
        text: {
          primary: "#1E1B4B",
          secondary: "#4338CA",
          muted: "#6B7280",
          inverse: "#FFFFFF",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        "soft": "0 2px 8px rgba(99, 102, 241, 0.08)",
        "card": "0 4px 24px rgba(99, 102, 241, 0.12)",
        "card-hover": "0 8px 32px rgba(99, 102, 241, 0.2)",
        "glow": "0 0 30px rgba(99, 102, 241, 0.3)",
        "glow-cta": "0 0 20px rgba(16, 185, 129, 0.4)",
        "glass": "0 8px 32px rgba(31, 38, 135, 0.15)",
      },
      backdropBlur: {
        "glass": "16px",
      },
    },
  },
  plugins: [],
};
export default config;
