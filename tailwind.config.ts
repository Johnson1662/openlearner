import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', '-apple-system', 'BlinkMacSystemFont', '"Helvetica Neue"', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        duo: {
          green: "#58CC02",
          greenDark: "#46A302",
          greenLight: "#D7FFB8",
          greenBg: "#F0FDE4",
          blue: "#1CB0F6",
          blueDark: "#1899D6",
          blueLight: "#DDF4FF",
          gold: "#FFC800",
          goldDark: "#D4A500",
          goldLight: "#FFF7D6",
          red: "#FF4B4B",
          redDark: "#D03B3B",
          redLight: "#FFDFE0",
          gray: "#E5E5E5",
          grayDark: "#AFAFAF",
          text: "#3C3C3C",
          textSoft: "#777777",
          textMuted: "#AFAFAF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        "duo-btn": "0 5px 0 0 #46A302",
        "duo-btn-blue": "0 5px 0 0 #1899D6",
        /* "duo-card": "0 3px 0 0 #E5E5E5", */ // Unused - replaced with standard Tailwind shadows
        /* "duo-choice": "0 4px 0 0 #E5E5E5", */ // Unused - replaced with standard Tailwind shadows
      },
    },
  },
  plugins: [],
};
export default config;
