import React from "react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  const defaultIcon = (
    <svg
      className="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  return (
    <div className={cn("text-center py-12", className)}>
      {icon || defaultIcon}

      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>

      {description && (
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
};

// Specific empty states untuk modul yang berbeda
export const MotorEmptyState: React.FC<{ onAddMotor?: () => void }> = ({
  onAddMotor,
}) => (
  <EmptyState
    title="No motors found"
    description="Get started by adding your first motorcycle to the system."
    icon={
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>
    }
    action={
      onAddMotor
        ? {
            label: "Add Motor",
            onClick: onAddMotor,
          }
        : undefined
    }
  />
);

export const PenyewaEmptyState: React.FC<{ onAddPenyewa?: () => void }> = ({
  onAddPenyewa,
}) => (
  <EmptyState
    title="No customers found"
    description="Start by adding your first customer to the system."
    icon={
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    }
    action={
      onAddPenyewa
        ? {
            label: "Add Customer",
            onClick: onAddPenyewa,
          }
        : undefined
    }
  />
);

export const SewaEmptyState: React.FC<{ onAddSewa?: () => void }> = ({
  onAddSewa,
}) => (
  <EmptyState
    title="No rentals found"
    description="Create your first rental transaction to get started."
    icon={
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    }
    action={
      onAddSewa
        ? {
            label: "Create Rental",
            onClick: onAddSewa,
          }
        : undefined
    }
  />
);
