import React from "react";
import { useTheme } from "../../hooks/useTheme";
import { CreditScore } from "../../types/penyewa";

interface CreditScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const CreditScoreCircle: React.FC<CreditScoreCircleProps> = ({
  score,
  size = 120,
  strokeWidth = 8,
}) => {
  const { isDark } = useTheme();

  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "#10B981"; // green-500
    if (score >= 60) return "#3B82F6"; // blue-500
    if (score >= 40) return "#F59E0B"; // yellow-500
    if (score >= 20) return "#EF4444"; // red-500
    return "#7C2D12"; // red-800
  };

  const getScoreLevel = (score: number): CreditScore["level"] => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    if (score >= 20) return "Poor";
    return "Very Poor";
  };

  const scoreColor = getScoreColor(score);
  const scoreLevel = getScoreLevel(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDark ? "#374151" : "#E5E7EB"}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className={`text-2xl font-bold ${
              isDark ? "text-dark-primary" : "text-gray-900"
            }`}
          >
            {score}
          </div>
          <div
            className="text-xs font-medium mt-1"
            style={{ color: scoreColor }}
          >
            {scoreLevel}
          </div>
        </div>
      </div>
    </div>
  );
};
