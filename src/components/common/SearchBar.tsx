import React, { useState, useEffect } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
  showButton?: boolean;
  buttonText?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search...",
  delay = 300,
  className,
  showButton = false,
  buttonText = "Search",
}) => {
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!showButton) {
      const timer = setTimeout(() => {
        onSearch(query);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [query, delay, onSearch, showButton]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsTyping(true);
          }}
          onBlur={() => setIsTyping(false)}
          placeholder={placeholder}
          className={cn(
            "block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md leading-5",
            "bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400",
            "focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
            showButton && "pr-24"
          )}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg
              className="h-4 w-4 text-gray-400 hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {showButton && (
          <div className="absolute right-1">
            <Button type="submit" size="sm" className="h-7 text-xs">
              {buttonText}
            </Button>
          </div>
        )}
      </div>

      {isTyping && !showButton && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 p-2 z-10">
          <div className="text-sm text-gray-500">Typing...</div>
        </div>
      )}
    </form>
  );
};
