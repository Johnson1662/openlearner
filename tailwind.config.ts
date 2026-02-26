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
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: "#007AFF",
          secondary: "#5856D6",
          cta: "#34C759",
          ctaHover: "#2DB84E",
          accent: "#FF9F0A",
          yellow: "#FF9F0A",
          blue: "#007AFF",
          purple: "#5856D6",
          success: "#34C759",
          warning: "#FF9F0A",
          error: "#FF3B30",
        },
        surface: {
          bg: "#FAFAFA",
          bgSecondary: "#F5F5F7",
          card: "#FFFFFF",
          cardHover: "#FFFFFF",
          border: "rgba(0, 0, 0, 0.06)",
          glass: "#FFFFFF",
        },
        text: {
          primary: "#1d1d1f",
          secondary: "#6e6e73",
          muted: "#86868b",
          inverse: "#FFFFFF",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      boxShadow: {
        "soft": "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)",
        "card": "0 2px 8px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.08), 0 16px 40px rgba(0, 0, 0, 0.08)",
        "glow": "0 0 24px rgba(0, 122, 255, 0.15)",
        "glow-cta": "0 0 16px rgba(52, 199, 89, 0.2)",
        "glass": "0 1px 3px rgba(0, 0, 0, 0.04)",
      },
      backdropBlur: {
        "glass": "20px",
      },
    },
  },
  plugins: [],
};
export default config;
