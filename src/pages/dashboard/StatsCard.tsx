import React from "react";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "red" | "orange" | "indigo";
  format?: "number" | "currency";
  compact?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

const StatsCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  format = "number",
  compact = false,
  trend,
  subtitle,
}) => {
  const { isDark } = useTheme();

  // Color classes untuk light dan dark mode
  const colorClasses = {
    blue: {
      light: "bg-blue-50 text-blue-600 border-blue-200",
      dark: "bg-blue-900/20 text-blue-300 border-blue-800",
      iconLight: "bg-blue-100 text-blue-600",
      iconDark: "bg-blue-900/30 text-blue-400",
    },
    green: {
      light: "bg-green-50 text-green-600 border-green-200",
      dark: "bg-green-900/20 text-green-300 border-green-800",
      iconLight: "bg-green-100 text-green-600",
      iconDark: "bg-green-900/30 text-green-400",
    },
    purple: {
      light: "bg-purple-50 text-purple-600 border-purple-200",
      dark: "bg-purple-900/20 text-purple-300 border-purple-800",
      iconLight: "bg-purple-100 text-purple-600",
      iconDark: "bg-purple-900/30 text-purple-400",
    },
    red: {
      light: "bg-red-50 text-red-600 border-red-200",
      dark: "bg-red-900/20 text-red-300 border-red-800",
      iconLight: "bg-red-100 text-red-600",
      iconDark: "bg-red-900/30 text-red-400",
    },
    orange: {
      light: "bg-orange-50 text-orange-600 border-orange-200",
      dark: "bg-orange-900/20 text-orange-300 border-orange-800",
      iconLight: "bg-orange-100 text-orange-600",
      iconDark: "bg-orange-900/30 text-orange-400",
    },
    indigo: {
      light: "bg-indigo-50 text-indigo-600 border-indigo-200",
      dark: "bg-indigo-900/20 text-indigo-300 border-indigo-800",
      iconLight: "bg-indigo-100 text-indigo-600",
      iconDark: "bg-indigo-900/30 text-indigo-400",
    },
  };

  const currentColor = colorClasses[color];
  const cardClass = isDark ? currentColor.dark : currentColor.light;
  const iconClass = isDark ? currentColor.iconDark : currentColor.iconLight;

  const formatValue = (val: number | string) => {
    if (format === "currency" && typeof val === "number") {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(val);
    }
    return val.toLocaleString("id-ID");
  };

  return (
    <Card
      className={`rm-card border-2 ${cardClass} transition-all duration-200 hover:scale-105 hover:shadow-lg ${
        compact ? "p-3 sm:p-4 md:p-6" : "p-4 sm:p-6"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`${compact ? "min-w-0 flex-1" : "flex-1"}`}>
          <p
            className={`font-medium opacity-80 mb-1 ${
              compact ? "text-xs sm:text-sm" : "text-sm"
            } ${isDark ? "text-dark-secondary" : "text-gray-600"}`}
          >
            {title}
          </p>
          <p
            className={`font-bold ${
              compact ? "text-lg sm:text-xl md:text-2xl" : "text-xl sm:text-2xl"
            } ${isDark ? "text-dark-primary" : "text-gray-900"}`}
          >
            {formatValue(value)}
          </p>

          {/* Subtitle dan Trend */}
          {(subtitle || trend) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && (
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    trend.isPositive
                      ? isDark
                        ? "bg-green-900/20 text-green-300"
                        : "bg-green-100 text-green-700"
                      : isDark
                      ? "bg-red-900/20 text-red-300"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
              )}
              {subtitle && (
                <span
                  className={`text-xs ${
                    isDark ? "text-dark-muted" : "text-gray-500"
                  }`}
                >
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon Container */}
        <div
          className={`${iconClass} ${
            compact ? "p-1.5 sm:p-2 md:p-3 rounded-lg" : "p-2 sm:p-3 rounded-xl"
          } flex-shrink-0 ml-2 transition-colors duration-200`}
        >
          <div className={compact ? "w-4 h-4 sm:w-5 sm:h-5" : "w-6 h-6"}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
