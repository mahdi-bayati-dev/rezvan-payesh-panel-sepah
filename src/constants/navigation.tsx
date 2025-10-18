// src/constants/navigation.ts

import { LayoutDashboard, Users, FileText, BarChart, Shield, History } from "lucide-react";

// تعریف تایپ برای هر آیتم از منو
export interface NavItem {
  label: string; // متنی که نمایش داده می‌شود
  href: string; // آدرس لینک
  icon: React.ReactNode; // کامپوننت آیکون
}

// لیست لینک‌های اصلی سایدبار
export const mainNavItems: NavItem[] = [
  {
    label: "داشبورد",
    href: "/",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "کارمندان",
    href: "/users",
    icon: <Users size={20} />,
  },
  {
    label: "درخواست‌ها",
    href: "/requests",
    icon: <FileText size={20} />,
  },
  {
    label: "گزارش‌ها",
    href: "/reports",
    icon: <BarChart size={20} />,
  },
  {
    label: "مدیریت ادمین‌ها",
    href: "/admin-management",
    icon: <Shield size={20} />,
  },
  {
    label: "تاریخچه",
    href: "/history",
    icon: <History size={20} />,
  },
];