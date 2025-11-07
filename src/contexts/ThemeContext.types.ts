export type Theme = "light" | "dark";

export interface ThemeContextValue {
  isDark: boolean;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}
