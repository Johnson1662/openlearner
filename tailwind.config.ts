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
        sans: ['Nunito', '-apple-system', 'BlinkMacSystemFont', '"Helvetica Neue"', 'sans-serif'],
      },
      colors: {
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
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        "duo-btn": "0 5px 0 0 #46A302",
        "duo-btn-blue": "0 5px 0 0 #1899D6",
        "duo-card": "0 3px 0 0 #E5E5E5",
        "duo-choice": "0 4px 0 0 #E5E5E5",
      },
    },
  },
  plugins: [],
};
export default config;
