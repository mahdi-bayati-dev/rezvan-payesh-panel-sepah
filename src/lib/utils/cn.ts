import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * تابع استاندارد cn برای ترکیب کلاس‌های Tailwind
 * این تابع تداخل کلاس‌ها را حل می‌کند (مثلاً p-4 جایگزین p-2 می‌شود)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}