import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class values into a single string using clsx and tailwind-merge.
 * This utility is used for conditionally applying class names in components.
 * 
 * @param inputs - Class values to merge
 * @returns A merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 