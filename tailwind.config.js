/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        // Custom color palette
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        144: "36rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      screens: {
        xs: "475px",
        "3xl": "1920px",
        "4xl": "2560px",
      },
      animation: {
        // Background & decorative animations
        "gradient-shift": "gradientShift 15s ease infinite",
        "gradient-x": "gradientX 15s ease infinite",
        "gradient-y": "gradientY 10s ease infinite",
        "float-slow": "floatSlow 8s ease-in-out infinite",
        "float-medium": "floatMedium 6s ease-in-out infinite",
        "float-fast": "floatFast 4s ease-in-out infinite",
        "grid-pan": "gridPan 20s linear infinite",

        // Page transition animations
        "slide-in-right": "slideInFromRight 0.5s ease-out",
        "slide-in-left": "slideInFromLeft 0.5s ease-out",
        "slide-out-right": "slideOutToRight 0.3s ease-in",
        "slide-out-left": "slideOutToLeft 0.3s ease-in",

        // Fade animations
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-out": "fadeOut 0.3s ease-in",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "fade-in-scale": "fadeInScale 0.4s ease-out",

        // Interactive animations
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spinSlow 3s linear infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",

        // Loading animations
        "progress-indeterminate":
          "progressIndeterminate 1.5s ease-in-out infinite",
        "skeleton-pulse": "skeletonPulse 2s ease-in-out infinite",

        // Special effects
        glow: "glow 2s ease-in-out infinite alternate",
        tilt: "tilt 10s ease-in-out infinite",
      },
      keyframes: {
        // Background animations
        gradientShift: {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        gradientX: {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        gradientY: {
          "0%, 100%": { "background-position": "50% 0%" },
          "50%": { "background-position": "50% 100%" },
        },
        floatSlow: {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-20px) rotate(180deg)",
          },
        },
        floatMedium: {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-15px) rotate(90deg)",
          },
        },
        floatFast: {
          "0%, 100%": {
            transform: "translateY(0px) scale(1)",
          },
          "50%": {
            transform: "translateY(-10px) scale(1.05)",
          },
        },
        gridPan: {
          "0%": { transform: "translate(0, 0)" },
          "100%": { transform: "translate(-64px, -64px)" },
        },

        // Page transition animations
        slideInFromRight: {
          from: {
            transform: "translateX(30px)",
            opacity: "0",
          },
          to: {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        slideInFromLeft: {
          from: {
            transform: "translateX(-30px)",
            opacity: "0",
          },
          to: {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        slideOutToRight: {
          from: {
            transform: "translateX(0)",
            opacity: "1",
          },
          to: {
            transform: "translateX(30px)",
            opacity: "0",
          },
        },
        slideOutToLeft: {
          from: {
            transform: "translateX(0)",
            opacity: "1",
          },
          to: {
            transform: "translateX(-30px)",
            opacity: "0",
          },
        },

        // Fade animations
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeOut: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        fadeInUp: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeInDown: {
          from: {
            opacity: "0",
            transform: "translateY(-20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeInScale: {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },

        // Interactive animations
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-468px 0" },
          "100%": { backgroundPosition: "468px 0" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },

        // Loading animations
        progressIndeterminate: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "50%": {
            transform: "translateX(-50%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        skeletonPulse: {
          "0%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.4",
          },
          "100%": {
            opacity: "1",
          },
        },

        // Special effects
        glow: {
          from: {
            boxShadow: "0 0 20px -10px rgb(59 130 246)",
          },
          to: {
            boxShadow: "0 0 20px 0px rgb(59 130 246)",
          },
        },
        tilt: {
          "0%, 50%, 100%": {
            transform: "rotate(0deg)",
          },
          "25%": {
            transform: "rotate(1deg)",
          },
          "75%": {
            transform: "rotate(-1deg)",
          },
        },
      },
      backgroundSize: {
        "200%": "200% 200%",
        "300%": "300% 300%",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
        transform: "transform",
      },
      transitionDuration: {
        2000: "2000ms",
        3000: "3000ms",
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "bounce-out": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
      scale: {
        102: "1.02",
        98: "0.98",
      },
      rotate: {
        135: "135deg",
        "-135": "-135deg",
      },
      blur: {
        "4xl": "72px",
        "5xl": "96px",
      },
    },
  },
  plugins: [
    // Plugin untuk custom utilities
    function ({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        // Glass morphism utilities
        ".glass-effect": {
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        },
        ".glass-dark": {
          background: "rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(16px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        ".glass-card": {
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px) saturate(160%)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
        },

        // Text gradient
        ".text-gradient": {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        },

        // Custom scrollbar
        ".custom-scrollbar": {
          scrollbarWidth: "thin",
          scrollbarColor: `${theme("colors.gray.400")} transparent`,
        },
        ".custom-scrollbar::-webkit-scrollbar": {
          width: "6px",
        },
        ".custom-scrollbar::-webkit-scrollbar-track": {
          background: "transparent",
        },
        ".custom-scrollbar::-webkit-scrollbar-thumb": {
          backgroundColor: theme("colors.gray.400"),
          borderRadius: "3px",
        },
        ".custom-scrollbar::-webkit-scrollbar-thumb:hover": {
          backgroundColor: theme("colors.gray.500"),
        },

        // Safe area utilities
        ".safe-area-top": {
          paddingTop: "env(safe-area-inset-top)",
        },
        ".safe-area-bottom": {
          paddingBottom: "env(safe-area-inset-bottom)",
        },

        // Transform GPU acceleration
        ".transform-gpu": {
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          perspective: "1000",
        },
      };

      addUtilities(newUtilities, ["responsive", "hover"]);

      // Component classes
      const components = {
        ".btn-primary": {
          backgroundColor: theme("colors.primary.600"),
          color: "white",
          padding: `${theme("spacing.2")} ${theme("spacing.4")}`,
          borderRadius: theme("borderRadius.md"),
          fontWeight: theme("fontWeight.medium"),
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: theme("colors.primary.700"),
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
      };

      addComponents(components);
    },
  ],
  // Variants untuk kontrol lebih detail
  variants: {
    extend: {
      animation: ["responsive", "motion-safe", "motion-reduce", "hover"],
      transform: ["responsive", "hover", "focus"],
      backdropBlur: ["responsive"],
      opacity: ["responsive", "hover", "focus", "disabled"],
      scale: ["responsive", "hover", "active"],
    },
  },
  // Dark mode configuration
  darkMode: "class", // atau 'media' berdasarkan preferensi sistem
};
