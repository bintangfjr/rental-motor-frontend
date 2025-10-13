import React, { useState } from "react";
import { cn } from "../../utils/cn";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  multiple?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  className,
  multiple = false,
}) => {
  const [openItems, setOpenItems] = useState<string[]>(
    items.filter((item) => item.defaultOpen).map((item) => item.id)
  );

  const toggleItem = (itemId: string) => {
    if (multiple) {
      setOpenItems((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setOpenItems((prev) => (prev.includes(itemId) ? [] : [itemId]));
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => (
        <div key={item.id} className="border border-gray-200 rounded-lg">
          <button
            className="flex items-center justify-between w-full p-4 text-left font-medium text-gray-900 hover:bg-gray-50"
            onClick={() => toggleItem(item.id)}
          >
            <span>{item.title}</span>
            <svg
              className={cn(
                "w-5 h-5 transition-transform",
                openItems.includes(item.id) && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {openItems.includes(item.id) && (
            <div className="p-4 border-t border-gray-200">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};
