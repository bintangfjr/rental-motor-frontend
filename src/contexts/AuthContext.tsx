// contexts/AuthContext.tsx
import React, { createContext, useEffect, useState, useCallback } from "react";
import { authService } from "../services/authService";
import type { Admin, LoginData, ChangePasswordData } from "../types/admin";
import type { LoginResponse } from "../types/auth";

export interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (loginData: LoginData, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  changePassword: (passwordData: ChangePasswordData) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearAuth: () => void;
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  const checkAuthStatus = useCallback(async () => {
    try {
      const storedToken = authService.getToken();
      const storedAdmin = authService.getCurrentAdminFromStorage();

      if (storedToken && storedAdmin) {
        // Verify token is still valid
        const isValid = await authService.verifyToken();
        if (isValid) {
          setToken(storedToken);
          setAdmin(storedAdmin);
        } else {
          clearAuth();
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (
    loginData: LoginData,
    rememberMe = false
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const response: LoginResponse = await authService.adminLogin(
        loginData.username,
        loginData.password
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Login gagal");
      }

      const { admin: adminData, access_token } = response.data;

      // Normalize admin data to ensure consistent type
      const normalizedAdmin: Admin = {
        id: adminData.id,
        nama_lengkap: adminData.nama_lengkap,
        username: adminData.username,
        email: adminData.email,
        is_super_admin: adminData.is_super_admin,
        role: adminData.is_super_admin ? "super_admin" : "admin",
      };

      // Set auth state
      setAdmin(normalizedAdmin);
      setToken(access_token);

      // Store in appropriate storage
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("auth_token", access_token);
      storage.setItem("auth_admin", JSON.stringify(normalizedAdmin));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    clearAuth();
    // Optional: Call logout API
    // authService.logout();
  };

  const changePassword = async (
    passwordData: ChangePasswordData
  ): Promise<void> => {
    try {
      await authService.changePassword(
        passwordData.current_password,
        passwordData.password,
        passwordData.password_confirmation
      );
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      if (!admin?.id) return;

      const profile = await authService.getProfile();

      // Normalize the profile data
      const normalizedProfile: Admin = {
        ...profile,
        role: profile.is_super_admin ? "super_admin" : "admin",
      };

      setAdmin(normalizedProfile);

      // Update stored admin data
      const storedAdmin = authService.getCurrentAdminFromStorage();
      if (storedAdmin) {
        const storage = localStorage.getItem("auth_token")
          ? localStorage
          : sessionStorage;
        storage.setItem("auth_admin", JSON.stringify(normalizedProfile));
      }
    } catch (error) {
      console.error("Refresh profile error:", error);
      throw error;
    }
  };

  const clearAuth = (): void => {
    setAdmin(null);
    setToken(null);
    authService.logout();
  };

  const hasPermission = (permission: string): boolean => {
    if (!admin) return false;

    // Super admin has all permissions
    if (admin.is_super_admin) return true;

    // Define permissions for each role
    const rolePermissions: Record<string, string[]> = {
      super_admin: ["*"],
      admin: [
        "dashboard.view",
        "motors.view",
        "motors.create",
        "motors.edit",
        "penyewas.view",
        "penyewas.create",
        "penyewas.edit",
        "sewas.view",
        "sewas.create",
        "sewas.edit",
        "histories.view",
        "reports.view",
        "profile.view",
        "profile.edit",
      ],
    };

    const userRole = admin.is_super_admin ? "super_admin" : "admin";
    const permissions = rolePermissions[userRole] || [];
    return permissions.includes("*") || permissions.includes(permission);
  };

  const isSuperAdmin = (): boolean => {
    return admin?.is_super_admin || false;
  };

  const isAdmin = (): boolean => {
    return !isSuperAdmin();
  };

  const value: AuthContextType = {
    admin,
    token,
    isAuthenticated: !!admin && !!token,
    isLoading,
    login,
    logout,
    changePassword,
    refreshProfile,
    clearAuth,
    hasPermission,
    isSuperAdmin,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
