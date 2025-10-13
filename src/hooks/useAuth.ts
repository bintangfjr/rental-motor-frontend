import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import type { AuthContextType } from "../contexts/AuthContext.types";

/**
 * Custom hook untuk menggunakan auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Hook untuk memeriksa status autentikasi saja
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

/**
 * Hook untuk mendapatkan data admin yang sedang login
 */
export const useCurrentAdmin = () => {
  const { admin } = useAuth();
  return admin;
};

/**
 * Hook untuk mendapatkan token akses
 */
export const useAuthToken = () => {
  const { token } = useAuth();
  return token;
};

/**
 * Hook untuk memeriksa loading state
 */
export const useAuthLoading = () => {
  const { isLoading } = useAuth();
  return isLoading;
};
