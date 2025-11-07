import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function untuk menggabungkan class names dengan Tailwind CSS
 * Menggabungkan clsx dan tailwind-merge untuk handling class conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Conditional class names utility
 * Contoh: cnCondition('btn', { 'btn-primary': isPrimary, 'btn-disabled': isDisabled })
 */
export function cnCondition(
  base: string,
  conditions: Record<string, boolean | undefined>,
): string {
  const conditionalClasses = Object.entries(conditions)
    .filter(([_, condition]) => condition)
    .map(([className]) => className);

  return cn(base, ...conditionalClasses);
}

/**
 * Variant utility untuk component styling
 */
export function cnVariant<T extends string>(
  base: string,
  variants: Record<T, string>,
  variant?: T,
): string {
  return variant ? cn(base, variants[variant]) : base;
}

/**
 * Size utility untuk component sizing
 */
export function cnSize(
  base: string,
  sizes: Record<string, string>,
  size?: string,
): string {
  return size ? cn(base, sizes[size]) : base;
}

export default cn;
