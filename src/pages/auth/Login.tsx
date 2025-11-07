import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { authService } from "../../services/authService";
import type { Admin, LoginResponse } from "../../types";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const { setAuthData, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Redirect otomatis jika sudah login
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Username dan password harus diisi");
      setIsLoading(false);
      return;
    }

    try {
      const response: LoginResponse = await authService.adminLogin(
        username,
        password
      );

      if (!response.success) {
        setError(response.message || "Login gagal. Silakan coba lagi.");
        return;
      }

      if (!response.admin) {
        setError("Data admin tidak valid. Hubungi administrator.");
        return;
      }

      if (!response.access_token) {
        setError("Token tidak valid. Silakan coba login kembali.");
        return;
      }

      setAuthData(response.admin as Admin, response.access_token, rememberMe);

      // Tampilkan animasi sukses sebelum redirect
      setShowSuccessAnimation(true);

      // Tunggu animasi selesai sebelum redirect
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);
    } catch (err: any) {
      if (err.response?.data) {
        setError(
          err.response.data?.message || "Login gagal. Silakan coba lagi."
        );
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login gagal. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Tampilkan loading jika auth context masih loading
  if (authLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark ? "bg-dark-primary" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
              isDark ? "border-blue-400" : "border-blue-600"
            }`}
          ></div>
          <p
            className={`mt-4 ${
              isDark ? "text-dark-secondary" : "text-gray-600"
            }`}
          >
            Memuat...
          </p>
        </div>
      </div>
    );
  }

  // Tampilkan animasi sukses
  if (showSuccessAnimation) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark ? "bg-dark-primary" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div className="animate-bounce scale-150 mb-4">
            <svg
              className={`w-16 h-16 mx-auto ${
                isDark ? "text-green-400" : "text-green-500"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3
            className={`text-xl font-semibold mb-2 ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Login Berhasil!
          </h3>
          <p className={isDark ? "text-dark-secondary" : "text-gray-600"}>
            Mengarahkan ke dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8 ${
        isDark ? "bg-dark-primary" : "bg-gray-50"
      }`}
    >
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isDark
              ? "bg-dark-primary"
              : "bg-gradient-to-br from-blue-50/30 to-purple-50/30"
          }`}
        ></div>

        {/* Background pattern untuk dark mode */}
        {isDark && (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>
        )}
      </div>

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2
            className={`text-3xl font-bold ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            Masuk ke Sistem
          </h2>
          <p
            className={`mt-2 text-sm ${
              isDark ? "text-dark-secondary" : "text-gray-600"
            }`}
          >
            Sistem Manajemen Rental Motor
          </p>
        </div>

        {/* Login Form */}
        <Card
          className={`p-8 shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
            isDark
              ? "bg-dark-card border-dark-border hover:border-blue-500/30"
              : "bg-white border-gray-200 hover:border-blue-300"
          }`}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div
                className={`px-4 py-3 rounded-lg text-sm border ${
                  isDark
                    ? "bg-red-900/20 border-red-800 text-red-300"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className={`block text-sm font-medium ${
                  isDark ? "text-dark-secondary" : "text-gray-700"
                }`}
              >
                Username
              </label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className={`pl-10 transition-all duration-200 ${
                    isDark
                      ? "bg-dark-secondary border-dark-border text-dark-primary focus:border-blue-500 focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  disabled={isLoading}
                  required
                  autoComplete="username"
                />
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? "text-dark-muted" : "text-gray-400"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className={`block text-sm font-medium ${
                  isDark ? "text-dark-secondary" : "text-gray-700"
                }`}
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className={`pl-10 transition-all duration-200 ${
                    isDark
                      ? "bg-dark-secondary border-dark-border text-dark-primary focus:border-blue-500 focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                />
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? "text-dark-muted" : "text-gray-400"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={`h-4 w-4 rounded focus:ring-2 focus:ring-offset-2 transition-colors ${
                    isDark
                      ? "text-blue-500 bg-dark-secondary border-dark-border focus:ring-blue-500 focus:ring-offset-dark-primary"
                      : "text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-offset-white"
                  }`}
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember-me"
                  className={`ml-2 block text-sm ${
                    isDark ? "text-dark-secondary" : "text-gray-900"
                  }`}
                >
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className={`font-medium transition-colors hover:underline ${
                    isDark
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-500"
                  }`}
                >
                  Lupa password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 text-base font-medium transition-all duration-200 hover:scale-105"
                variant="primary"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sedang masuk...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Masuk
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p
              className={`text-sm ${
                isDark ? "text-dark-muted" : "text-gray-600"
              }`}
            >
              Tidak punya akun?{" "}
              <Link
                to="/register"
                className={`font-medium transition-colors hover:underline ${
                  isDark
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-500"
                }`}
              >
                Hubungi administrator
              </Link>
            </p>
          </div>
        </Card>

        {/* Copyright */}
        <div
          className={`text-center text-xs transition-colors ${
            isDark ? "text-dark-muted" : "text-gray-500"
          }`}
        >
          © {new Date().getFullYear()} Sistem Manajemen Rental Motor
        </div>
      </div>
    </div>
  );
};

export default Login;
