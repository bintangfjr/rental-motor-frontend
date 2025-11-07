// src/services/api.ts
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Buat instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Ambil token dari localStorage atau sessionStorage
const getToken = (): string | null => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

// Interceptor request: tambahkan Authorization header
api.interceptors.request.use((config) => {
  const token = getToken();

  // Pastikan headers tidak undefined
  config.headers = config.headers || {};

  if (token) {
    // Gunakan header Authorization
    (config.headers as Record<string, string>)["Authorization"] =
      `Bearer ${token}`;
  }

  return config;
});

// Interceptor response: handle error 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Hapus token dan data admin
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("admin");

      // Redirect ke login
      window.location.href = "/login";
    }

    console.error("API error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default api;
