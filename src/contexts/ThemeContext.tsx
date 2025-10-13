import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export type Theme = "light" | "dark" | "system";

export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Export context
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

// Export ThemeProvider dengan benar
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "system",
}) => {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, []);

  const resolveTheme = useCallback(
    (): "light" | "dark" => (theme === "system" ? getSystemTheme() : theme),
    [theme, getSystemTheme]
  );

  const applyTheme = useCallback((newTheme: "light" | "dark") => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
    root.setAttribute("data-theme", newTheme);
    setResolvedTheme(newTheme);
  }, []);

  useEffect(() => {
    applyTheme(resolveTheme());
  }, [theme, applyTheme, resolveTheme]);

  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme(getSystemTheme());

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme, getSystemTheme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "light" ? "dark" : current === "dark" ? "system" : "light"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: theme || defaultTheme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
