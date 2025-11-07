// src/components/ui/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean; // Jika hanya super admin yang boleh akses
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireSuperAdmin = false,
}) => {
  const { admin, isAuthenticated, isLoading } = useAuth();

  // Tampilkan loading sementara cek auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect ke login jika tidak authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect jika membutuhkan super admin tetapi admin bukan super admin
  if (requireSuperAdmin && !admin?.is_super_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children jika authenticated dan memenuhi syarat
  return <>{children}</>;
};

export default ProtectedRoute;
