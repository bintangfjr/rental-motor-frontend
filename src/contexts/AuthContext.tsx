import { createContext } from "react";
import type { AuthContextType } from "./AuthContext.types";

// Buat context dengan nilai default
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
