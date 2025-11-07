import { createContext } from "react";
import { ThemeContextValue } from "./ThemeContext.types";

// Context creation dipisah ke file non-component
export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);
