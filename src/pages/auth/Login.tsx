import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import type { Admin, LoginResponse } from "../../types";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { setAuthData, isAuthenticated, isLoading: authLoading } = useAuth(); // ✅ Gunakan setAuthData
  const navigate = useNavigate();

  // Redirect otomatis jika sudah login
  React.useEffect(() => {
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
      console.log("Mengirim request login:", { username, password });

      // ✅ Lakukan API call hanya di authService
      const response: LoginResponse = await authService.adminLogin(
        username,
        password
      );
      console.log("Response login:", response);

      // Validasi response
      if (!response.success) {
        setError(response.message || "Login gagal. Silakan coba lagi.");
        return;
      }

      // Validasi admin
      if (!response.admin) {
        setError("Data admin tidak valid. Hubungi administrator.");
        return;
      }

      // Validasi access_token
      if (!response.access_token) {
        setError("Token tidak valid. Silakan coba login kembali.");
        return;
      }

      // ✅ PERBAIKAN: Gunakan setAuthData untuk menyimpan data ke context
      // Tidak perlu await karena setAuthData synchronous
      setAuthData(response.admin as Admin, response.access_token, rememberMe);

      console.log("Login berhasil, redirect ke dashboard...");

      // Redirect ke dashboard
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);

      // Handle error dari authService
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Masuk ke akun admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistem Manajemen Rental Motor
          </p>
        </div>

        <Card className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="mt-1"
                disabled={isLoading}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="mt-1"
                disabled={isLoading}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Lupa password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center"
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
                  "Masuk"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Tidak punya akun?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Hubungi administrator
              </Link>
            </p>
          </div>
        </Card>

        <div className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Sistem Manajemen Rental Motor
        </div>
      </div>
    </div>
  );
};

export default Login;
