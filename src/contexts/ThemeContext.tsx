import React, { useState, useEffect, ReactNode } from "react";
import { Theme, ThemeContextValue } from "./ThemeContext.types";
import { ThemeContext } from "./ThemeContextInstance";

// Provider only - tidak ada createContext di sini
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "light",
}) => {
  const [isDark, setIsDark] = useState(false);
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const initialTheme =
      savedTheme || (systemPrefersDark ? "dark" : defaultTheme);
    const shouldBeDark = initialTheme === "dark";

    setIsDark(shouldBeDark);
    setThemeState(initialTheme);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [defaultTheme]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    const newTheme: Theme = newIsDark ? "dark" : "light";

    setIsDark(newIsDark);
    setThemeState(newTheme);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    const newIsDark = newTheme === "dark";
    setIsDark(newIsDark);
    setThemeState(newTheme);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  const value: ThemeContextValue = {
    isDark,
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
