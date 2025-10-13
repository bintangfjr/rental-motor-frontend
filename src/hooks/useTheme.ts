import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import type { ThemeContextType } from "../contexts/ThemeContext";

// Hook untuk menggunakan ThemeContext
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Hook helper untuk mendapatkan class/theme
export const useThemeClass = () => {
  const { resolvedTheme } = useTheme();
  return {
    themeClass: resolvedTheme,
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light",
  };
};
