import React from "react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";

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
      className={cn("bg-white rounded-lg border border-gray-200", className)}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          {selectedCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {selectedCount}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filters.map((filter) => (
          <div
            key={filter.id}
            className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0"
          >
            <h4 className="font-medium text-gray-900 mb-3">{filter.title}</h4>

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
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {option.label}
                      {option.count !== undefined && (
                        <span className="text-gray-500 ml-1">
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
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {option.label}
                      {option.count !== undefined && (
                        <span className="text-gray-500 ml-1">
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

      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
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
