import { useTheme } from "@/hooks/useTheme";

// Hook helper untuk mendapatkan class/theme utilities
export const useThemeClass = () => {
  const { isDark, theme } = useTheme();

  return {
    // Basic info
    theme,
    isDark,
    isLight: !isDark,

    // Class names
    themeClass: isDark ? "dark" : "light",
    bgClass: isDark ? "bg-dark-primary" : "bg-white",
    textClass: isDark ? "text-dark-primary" : "text-gray-900",
    cardClass: isDark
      ? "bg-dark-card border-dark-border"
      : "bg-white border-gray-200",
    borderClass: isDark ? "border-dark-border" : "border-gray-200",

    // Component classes
    sidebarClass: isDark
      ? "bg-dark-secondary border-dark-border"
      : "bg-white border-gray-200",
    headerClass: isDark
      ? "bg-dark-secondary border-dark-border"
      : "bg-white border-gray-200",
    inputClass: isDark
      ? "bg-dark-secondary border-dark-border text-dark-primary"
      : "bg-white border-gray-300 text-gray-900",

    // Color utilities
    colors: {
      background: isDark ? "#0f172a" : "#ffffff",
      text: isDark ? "#f8fafc" : "#111827",
      card: isDark ? "#1e293b" : "#ffffff",
      border: isDark ? "#374151" : "#e5e7eb",
    },
  };
};
