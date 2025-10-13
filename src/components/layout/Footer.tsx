import React from "react";
import { cn } from "../../utils/cn";

interface FooterProps {
  simplified?: boolean;
  className?: string;
  screenSize?: "mobile" | "tablet" | "desktop" | "xl" | "2xl";
}

export const Footer: React.FC<FooterProps> = ({
  simplified = false,
  className,
  screenSize = "desktop",
}) => {
  const currentYear = new Date().getFullYear();

  // Responsive padding berdasarkan screen size
  const getFooterPadding = () => {
    switch (screenSize) {
      case "2xl":
        return "px-8 2xl:px-12 py-8";
      case "xl":
        return "px-6 xl:px-8 py-6";
      default:
        return "px-4 sm:px-6 lg:px-8 py-4";
    }
  };

  if (simplified) {
    return (
      <footer className={cn("bg-white border-t border-gray-200", className)}>
        <div className={cn("mx-auto max-w-7xl", getFooterPadding())}>
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-gray-500 text-center sm:text-left">
              © {currentYear} Rental Motor. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>v1.0.0</span>
              <span>•</span>
              <span>Powered by React & NestJS</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn("bg-white border-t border-gray-200", className)}>
      <div className={cn("mx-auto max-w-7xl", getFooterPadding())}>
        <div
          className={cn(
            "grid gap-8",
            screenSize === "2xl"
              ? "grid-cols-1 lg:grid-cols-4"
              : screenSize === "xl"
              ? "grid-cols-1 lg:grid-cols-4"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {/* Company Info */}
          <div
            className={screenSize === "2xl" ? "lg:col-span-2" : "lg:col-span-2"}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={cn(
                  "bg-blue-600 rounded-lg flex items-center justify-center",
                  screenSize === "2xl" ? "w-10 h-10" : "w-8 h-8"
                )}
              >
                <span
                  className={cn(
                    "text-white font-bold",
                    screenSize === "2xl" ? "text-base" : "text-sm"
                  )}
                >
                  RM
                </span>
              </div>
              <h3
                className={cn(
                  "font-semibold text-gray-900",
                  screenSize === "2xl" ? "text-xl" : "text-lg"
                )}
              >
                Rental Motor
              </h3>
            </div>
            <p
              className={cn(
                "text-gray-600 mb-4 max-w-md",
                screenSize === "2xl" ? "text-base" : "text-sm"
              )}
            >
              Penyedia layanan rental motor terpercaya dengan armada terbaru dan
              pelayanan profesional untuk kenyamanan perjalanan Anda.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>🟢 System Online</span>
              <span>•</span>
              <span>v1.0.0</span>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4
              className={cn(
                "font-semibold text-gray-900 mb-4",
                screenSize === "2xl" ? "text-lg" : "text-sm"
              )}
            >
              Kontak
            </h4>
            <ul
              className={cn(
                "space-y-2 text-gray-600",
                screenSize === "2xl" ? "text-base" : "text-sm"
              )}
            >
              <li className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>info@rentalmotor.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className={cn(
                "font-semibold text-gray-900 mb-4",
                screenSize === "2xl" ? "text-lg" : "text-sm"
              )}
            >
              Tautan Cepat
            </h4>
            <ul
              className={cn(
                "space-y-2 text-gray-600",
                screenSize === "2xl" ? "text-base" : "text-sm"
              )}
            >
              <li>
                <a
                  href="/dashboard"
                  className="hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/motors"
                  className="hover:text-blue-600 transition-colors"
                >
                  Daftar Motor
                </a>
              </li>
              <li>
                <a
                  href="/sewas"
                  className="hover:text-blue-600 transition-colors"
                >
                  Penyewaan
                </a>
              </li>
              <li>
                <a
                  href="/reports"
                  className="hover:text-blue-600 transition-colors"
                >
                  Laporan
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className={cn(
            "mt-8 pt-8 border-t border-gray-200",
            screenSize === "2xl" && "mt-10 pt-10"
          )}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p
              className={cn(
                "text-gray-500 text-center md:text-left",
                screenSize === "2xl" ? "text-base" : "text-sm"
              )}
            >
              © {currentYear}{" "}
              <span className="font-semibold">Rental Motor</span>. All rights
              reserved.
            </p>

            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <a
                href="/privacy"
                className="hover:text-gray-700 transition-colors"
              >
                Kebijakan Privasi
              </a>
              <a
                href="/terms"
                className="hover:text-gray-700 transition-colors"
              >
                Syarat & Ketentuan
              </a>
              <span className="text-gray-300">•</span>
              <span>Powered by React & NestJS</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
