// src/components/layout/Navigation.tsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

interface TabNavigationItem {
  name: string;
  href: string;
  current: boolean;
  badge?: number;
}

interface NavigationProps {
  tabs: TabNavigationItem[];
  className?: string;
  variant?: "default" | "underline";
}

export const Navigation: React.FC<NavigationProps> = ({
  tabs,
  className,
  variant = "default",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate(e.target.value);
  };

  const currentTab = tabs.find(
    (tab) => tab.current || location.pathname === tab.href
  );

  return (
    <div className={className}>
      {/* Mobile select */}
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
          value={currentTab?.href || ""}
          onChange={handleSelectChange}
        >
          {tabs.map((tab) => (
            <option key={tab.name} value={tab.href}>
              {tab.name}
              {tab.badge ? ` (${tab.badge})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:block">
        <nav
          className={cn(
            "flex space-x-4",
            variant === "underline" && "border-b border-gray-200"
          )}
        >
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.href}
              className={cn(
                "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors relative",
                variant === "default"
                  ? tab.current
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  : tab.current
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
              )}
              aria-current={tab.current ? "page" : undefined}
            >
              {tab.name}
              {tab.badge && (
                <span
                  className={cn(
                    "ml-2 py-0.5 px-1.5 rounded-full text-xs font-medium",
                    tab.current
                      ? "bg-blue-200 text-blue-800"
                      : "bg-gray-200 text-gray-800"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};
