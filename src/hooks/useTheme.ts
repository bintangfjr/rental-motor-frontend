import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContextInstance"; // Import dari file instance
import { ThemeContextValue } from "../contexts/ThemeContext.types";

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
