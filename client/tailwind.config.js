/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pastel: {
          cream: "#FFF8F5",
          blush: "#FDF0F7",
          mint: "#EEF6F0",
          plum: "#5C4A5A",
          muted: "#8B7A8F",
          rose: "#E8B4C8",
          "rose-hover": "#D9A0B8",
          chip: "#F0E6F4",
          "chip-border": "#E8D4E8",
          leaf: "#C5E1C8",
          safe: { bg: "#D4EDDA", text: "#3D6B4F" },
          caution: { bg: "#FFF3CD", text: "#7A6520" },
          danger: { bg: "#F8D7DA", text: "#8B3A42" },
          unknown: { bg: "#E8E4EC", text: "#6B6570" },
          local: { bg: "#E3F2FD", text: "#4A6FA5" },
          api: { bg: "#F3E5F5", text: "#6B4A7A" },
          tavily: { bg: "#E8F5E9", text: "#4A6B52" },
          fallback: { bg: "#FFF8E7", text: "#7A6B4A" },
        },
      },
      fontFamily: {
        sans: ["Nunito", "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 32px rgba(180, 140, 160, 0.12)",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.14" },
          "50%": { opacity: "0.42" },
        },
      },
      animation: {
        twinkle: "twinkle 5s ease-in-out infinite",
        "twinkle-slow": "twinkle 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
