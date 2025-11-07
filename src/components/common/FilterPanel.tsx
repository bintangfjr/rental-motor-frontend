import React from "react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { useTheme } from "@/hooks/useTheme";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  title: string;
  type: "checkbox" | "radio" | "range";
  options: FilterOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

interface FilterPanelProps {
  filters: FilterGroup[];
  onApply?: () => void;
  onReset?: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onApply,
  onReset,
  className,
}) => {
  const { isDark } = useTheme();

  const handleFilterChange = (filterId: string, value: string | string[]) => {
    const filter = filters.find((f) => f.id === filterId);
    if (filter) {
      filter.onChange(value);
    }
  };

  const getSelectedCount = () => {
    return filters.reduce((count, filter) => {
      if (Array.isArray(filter.value)) {
        return count + filter.value.length;
      }
      return count + (filter.value ? 1 : 0);
    }, 0);
  };

  const selectedCount = getSelectedCount();

  return (
    <div
      className={cn(
        "rm-card rounded-lg border transition-colors duration-200",
        isDark ? "border-dark-border" : "border-gray-200",
        className
      )}
    >
      <div
        className={cn(
          "p-4 border-b",
          isDark ? "border-dark-border" : "border-gray-200"
        )}
      >
        <div className="flex items-center justify-between">
          <h3
            className={cn(
              "text-lg font-medium",
              isDark ? "text-dark-primary" : "text-gray-900"
            )}
          >
            Filters
          </h3>
          {selectedCount > 0 && (
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                isDark
                  ? "bg-blue-900/20 text-blue-300"
                  : "bg-blue-100 text-blue-800"
              )}
            >
              {selectedCount}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filters.map((filter) => (
          <div
            key={filter.id}
            className={cn(
              "border-b pb-4 last:border-b-0 last:pb-0",
              isDark ? "border-dark-border" : "border-gray-200"
            )}
          >
            <h4
              className={cn(
                "font-medium mb-3",
                isDark ? "text-dark-primary" : "text-gray-900"
              )}
            >
              {filter.title}
            </h4>

            {filter.type === "checkbox" && (
              <div className="space-y-2">
                {filter.options.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filter.value as string[]).includes(
                        option.value
                      )}
                      onChange={(e) => {
                        const currentValue = filter.value as string[];
                        const newValue = e.target.checked
                          ? [...currentValue, option.value]
                          : currentValue.filter((v) => v !== option.value);
                        handleFilterChange(filter.id, newValue);
                      }}
                      className={cn(
                        "rounded focus:ring-2 focus:ring-offset-2 transition-colors",
                        isDark
                          ? "border-dark-border bg-dark-secondary text-blue-500 focus:ring-blue-500 focus:ring-offset-dark-primary"
                          : "border-gray-300 text-blue-600 focus:ring-blue-500"
                      )}
                    />
                    <span
                      className={cn(
                        "ml-2 text-sm",
                        isDark ? "text-dark-secondary" : "text-gray-700"
                      )}
                    >
                      {option.label}
                      {option.count !== undefined && (
                        <span
                          className={
                            isDark
                              ? "text-dark-muted ml-1"
                              : "text-gray-500 ml-1"
                          }
                        >
                          ({option.count})
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {filter.type === "radio" && (
              <div className="space-y-2">
                {filter.options.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name={filter.id}
                      value={option.value}
                      checked={filter.value === option.value}
                      onChange={(e) =>
                        handleFilterChange(filter.id, e.target.value)
                      }
                      className={cn(
                        "focus:ring-2 focus:ring-offset-2 transition-colors",
                        isDark
                          ? "border-dark-border bg-dark-secondary text-blue-500 focus:ring-blue-500 focus:ring-offset-dark-primary"
                          : "border-gray-300 text-blue-600 focus:ring-blue-500"
                      )}
                    />
                    <span
                      className={cn(
                        "ml-2 text-sm",
                        isDark ? "text-dark-secondary" : "text-gray-700"
                      )}
                    >
                      {option.label}
                      {option.count !== undefined && (
                        <span
                          className={
                            isDark
                              ? "text-dark-muted ml-1"
                              : "text-gray-500 ml-1"
                          }
                        >
                          ({option.count})
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "p-4 border-t rounded-b-lg",
          isDark
            ? "bg-dark-secondary border-dark-border"
            : "bg-gray-50 border-gray-200"
        )}
      >
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="flex-1"
          >
            Reset
          </Button>
          {onApply && (
            <Button size="sm" onClick={onApply} className="flex-1">
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
