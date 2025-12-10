import { useState, useEffect } from "react";

/**
 * هوک برای ایجاد تاخیر در آپدیت مقدار (مناسب برای جستجو)
 * @param value مقدار ورودی
 * @param delay زمان تاخیر به میلی‌ثانیه
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
