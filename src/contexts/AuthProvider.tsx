import React, { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthContextType } from "./AuthContext.types";
import type { Admin } from "../types/admin";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const storedAdmin =
        localStorage.getItem("admin") || sessionStorage.getItem("admin");

      if (storedToken && storedAdmin) {
        try {
          setToken(storedToken);
          setAdmin(JSON.parse(storedAdmin));
        } catch (err) {
          console.error("AuthProvider: failed parsing stored admin", err);
          localStorage.removeItem("token");
          localStorage.removeItem("admin");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("admin");
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("AuthProvider: login function called");
    } catch (error) {
      console.error("AuthProvider: login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthData = (
    adminData: Admin,
    authToken: string,
    rememberMe: boolean = false
  ) => {
    setAdmin(adminData);
    setToken(authToken);

    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("admin");

    if (rememberMe) {
      localStorage.setItem("token", authToken);
      localStorage.setItem("admin", JSON.stringify(adminData));
    } else {
      sessionStorage.setItem("token", authToken);
      sessionStorage.setItem("admin", JSON.stringify(adminData));
    }

    console.log("AuthProvider: auth data stored successfully");
  };

  const refreshUser = async (): Promise<void> => {
    if (!token) return;
    try {
      console.log("AuthProvider: refresh user");
    } catch (error) {
      console.error("AuthProvider: failed to refresh user", error);
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("admin");
    console.log("AuthProvider: user logged out");
  };

  const value: AuthContextType = {
    admin,
    token,
    isAuthenticated: !!admin && !!token,
    isLoading,
    login,
    logout,
    refreshUser,
    setAuthData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
