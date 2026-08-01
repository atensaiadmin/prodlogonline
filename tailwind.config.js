/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#faf9f7",
        surface: "#ffffff",
        "surface-2": "#f4f2ef",
        border: "#e9e6e1",
        "border-strong": "#dcd8d1",
        text: { DEFAULT: "#1b1813", secondary: "#7d7972", muted: "#a39f98" },
        accent: {
          DEFAULT: "#4f46e5",
          hover: "#4338ca",
          subtle: "#eef1fe",
        },
        inbox: "#6366f1",
        validating: "#d97706",
        building: "#0f9d6e",
        launched: "#0e8bb0",
        dead: "#8b8b85",
      },
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Newsreader"', "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,18,15,0.04), 0 1px 3px rgba(20,18,15,0.03)",
        "card-hover":
          "0 2px 4px rgba(20,18,15,0.05), 0 8px 24px rgba(20,18,15,0.08)",
        focus: "0 0 0 1px rgba(79,70,229,0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.96)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.25s ease-out both",
        pop: "pop 0.12s ease-out both",
      },
    },
  },
  plugins: [],
};
