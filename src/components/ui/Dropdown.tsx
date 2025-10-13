// src/components/ui/Dropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";

export interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onClick?: () => void; // opsional, bisa dipanggil saat item diklik
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
  onItemClick?: (item: DropdownItem) => void; // callback global
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = "left",
  className,
  onItemClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alignmentClasses = {
    left: "left-0",
    right: "right-0",
  };

  const handleItemClick = (item: DropdownItem) => {
    item.onClick?.(); // panggil onClick spesifik item
    onItemClick?.(item); // panggil callback global
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger button */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50",
            alignmentClasses[align],
            className
          )}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                {item.icon && <span className="mr-3">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
