import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import { Button } from "./Button";
import { useTheme } from "../../hooks/useTheme";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  showHeader?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  showHeader = true,
  footer,
  className,
}) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // Delay untuk trigger animation
      setTimeout(() => setIsVisible(true), 10);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "unset";
      };
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop dengan animasi */}
      <div
        className={cn(
          "fixed inset-0 transition-all duration-300 ease-in-out",
          isVisible
            ? isDark
              ? "bg-black/70 backdrop-blur-md"
              : "bg-black/50 backdrop-blur-sm"
            : "bg-black/0 backdrop-blur-0"
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          className={cn(
            "relative transform transition-all duration-300 ease-out w-full",
            sizeClasses[size],
            isVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-95",
            className
          )}
        >
          {/* Modal content */}
          <div
            className={cn(
              "relative rounded-xl shadow-2xl border-2 text-left overflow-hidden",
              isDark
                ? "bg-dark-card border-dark-border text-dark-primary shadow-xl"
                : "bg-white border-gray-200 text-gray-900 shadow-lg"
            )}
          >
            {/* Header */}
            {showHeader && (title || showCloseButton) && (
              <div
                className={cn(
                  "flex items-center justify-between px-6 py-4 border-b",
                  isDark
                    ? "border-dark-border bg-dark-secondary/50"
                    : "border-gray-200 bg-gray-50"
                )}
              >
                {title && (
                  <h3
                    className={cn(
                      "text-lg font-semibold leading-6",
                      isDark ? "text-dark-primary" : "text-gray-900"
                    )}
                  >
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className={cn(
                      "rounded-full p-2 hover:scale-110 transition-all duration-200",
                      isDark
                        ? "text-dark-secondary hover:bg-dark-hover hover:text-dark-primary"
                        : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    )}
                    aria-label="Close modal"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                )}
              </div>
            )}

            {/* Body */}
            <div
              className={cn(
                "px-6 py-4",
                !showHeader && "pt-6",
                !footer && "pb-6"
              )}
            >
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                className={cn(
                  "flex justify-end gap-3 px-6 py-4 border-t",
                  isDark
                    ? "border-dark-border bg-dark-secondary/30"
                    : "border-gray-200 bg-gray-50"
                )}
              >
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Modal Components untuk struktur yang lebih terorganisir
interface ModalComponentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalHeader: React.FC<ModalComponentProps> = ({
  children,
  className,
}) => <div className={cn("mb-4 space-y-2", className)}>{children}</div>;

export const ModalBody: React.FC<ModalComponentProps> = ({
  children,
  className,
}) => <div className={cn("space-y-4", className)}>{children}</div>;

export const ModalFooter: React.FC<ModalComponentProps> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      "flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border",
      className
    )}
  >
    {children}
  </div>
);

// Modal Title component
export const ModalTitle: React.FC<ModalComponentProps> = ({
  children,
  className,
}) => (
  <h3
    className={cn(
      "text-lg font-semibold leading-6",
      className,
      "text-gray-900 dark:text-dark-primary"
    )}
  >
    {children}
  </h3>
);

// Modal Description component
export const ModalDescription: React.FC<ModalComponentProps> = ({
  children,
  className,
}) => (
  <p
    className={cn(
      "text-sm opacity-80",
      className,
      "text-gray-600 dark:text-dark-secondary"
    )}
  >
    {children}
  </p>
);
