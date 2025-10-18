// src/providers/ThemeProvider.tsx

import { type ReactNode, useEffect } from "react";
import { useAppSelector } from "@/store/index";

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // ✅ نیازی به dispatch نداریم چون مقداردهی اولیه در خود slice انجام شده
  const theme = useAppSelector((state) => state.ui.theme);

  // ✅ این useEffect باقی می‌ماند تا هر بار که تم در ریداکس تغییر کرد،
  // کلاس html و مقدار localStorage را آپدیت کند.
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]); // این افکت فقط وقتی اجرا میشه که مقدار theme در ریداکس تغییر کنه

  return <>{children}</>;
};
