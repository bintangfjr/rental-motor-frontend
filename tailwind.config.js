/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        // Light theme color palette yang lebih soft
        light: {
          primary: "#f8fafc", // Soft white
          secondary: "#f1f5f9", // Very light slate
          accent: "#e2e8f0", // Light slate for hover
          card: "#ffffff", // White card background
          hover: "#f1f5f9", // Hover state
          border: "#e2e8f0", // Border color
          text: {
            primary: "#1e293b", // Dark slate for primary text
            secondary: "#475569", // Medium slate for secondary text
            muted: "#64748b", // Muted text
          },
        },
        // Dark theme color palette
        dark: {
          primary: "#0f172a",
          secondary: "#1e293b",
          accent: "#334155",
          card: "#1e293b",
          hover: "#334155",
          border: "#374151",
          text: {
            primary: "#f8fafc",
            secondary: "#cbd5e1",
            muted: "#94a3b8",
          },
        },
        brand: {
          blue: "#3b82f6",
          green: "#10b981",
          red: "#ef4444",
          yellow: "#f59e0b",
          purple: "#8b5cf6",
          orange: "#f97316",
        },
      },
      backgroundColor: {
        "dark-primary": "#0f172a",
        "dark-secondary": "#1e293b",
        "dark-card": "#1e293b",
        "dark-accent": "#334155",
        "dark-hover": "#334155",
      },
      textColor: {
        "dark-primary": "#f8fafc",
        "dark-secondary": "#cbd5e1",
        "dark-muted": "#94a3b8",
      },
      borderColor: {
        "dark-primary": "#374151",
        "dark-border": "#374151",
        "dark-secondary": "#4b5563",
      },
      animation: {
        "float-slow": "float-slow 8s ease-in-out infinite",
        "float-medium": "float-medium 6s ease-in-out infinite",
        "float-fast": "float-fast 4s ease-in-out infinite",
        "grid-pan": "grid-pan 20s linear infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "slide-in-from-right": "slide-in-from-right 0.5s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.5s ease-out",
        "slide-out-to-left": "slide-out-to-left 0.3s ease-in",
        "slide-out-to-right": "slide-out-to-right 0.3s ease-in",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.3s ease-in",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "fade-in-down": "fade-in-down 0.6s ease-out",
        "scale-in": "scale-in 0.5s ease-out",
        "scale-out": "scale-out 0.3s ease-in",
        "theme-transition": "theme-transition 0.3s ease-in-out",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(180deg)" },
        },
        "float-medium": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-15px) rotate(90deg)" },
        },
        "float-fast": {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-10px) scale(1.05)" },
        },
        "grid-pan": {
          "0%": { transform: "translate(0, 0)" },
          "100%": { transform: "translate(-64px, -64px)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(30px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-30px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out-to-left": {
          from: { transform: "translateX(0)", opacity: "1" },
          to: { transform: "translateX(-30px)", opacity: "0" },
        },
        "slide-out-to-right": {
          from: { transform: "translateX(0)", opacity: "1" },
          to: { transform: "translateX(30px)", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "scale-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.9)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-468px 0" },
          "100%": { backgroundPosition: "468px 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "theme-transition": {
          from: {
            backgroundColor: "var(--from-bg, transparent)",
            color: "var(--from-text, transparent)",
          },
          to: {
            backgroundColor: "var(--to-bg, transparent)",
            color: "var(--to-text, transparent)",
          },
        },
      },
    },
  },
  plugins: [],
};
