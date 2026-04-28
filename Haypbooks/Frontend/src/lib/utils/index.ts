/**
 * Shared utility functions — re-export or add small helpers here.
 * Import from '@/lib/utils' (this barrel) rather than individual files.
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export * from '../format'
export * from '../math'
export * from '../date'
