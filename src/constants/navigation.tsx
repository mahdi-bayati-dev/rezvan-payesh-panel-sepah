// src/constants/navigation.tsx

import {
  LayoutDashboard,
  CalendarDays,
  VectorSquare,
  SquareChartGantt,
  Cog,
  Network,
  Mails,
  Puzzle,
  ListCheck,
  ShieldCheck,
  UserCheck // ✅ آیکون جدید برای پروفایل من
} from "lucide-react";
import { ALL_ACCESS, ADMIN_ACCESS, SUPER_ADMIN_ONLY } from "./roles";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: string[];
  requiresEmployee?: boolean; // ✅ پراپرتی جدید برای شرط داشتن کارمند
}

export const mainNavItems: NavItem[] = [
  {
    label: "داشبورد",
    href: "/",
    icon: <LayoutDashboard size={20} />,
    allowedRoles: ALL_ACCESS,
  },
  {
    label: "پروفایل من", // ✅ آیتم جدید
    href: "/my-profile",
    icon: <UserCheck size={20} />,
    allowedRoles: ALL_ACCESS,
    requiresEmployee: true, // این فلگ به ما کمک می‌کند در سایدبار فیلتر کنیم
  },
  {
    label: "درخواست‌ها",
    href: "/requests",
    icon: <Mails size={20} />,
    allowedRoles: ALL_ACCESS,
  },
  {
    label: "گزارش ها",
    href: "/reports",
    icon: <ListCheck size={20} />,
    allowedRoles: ALL_ACCESS,
  },
  {
    label: "الگوی کاری",
    href: "/work-patterns",
    icon: <SquareChartGantt size={20} />,
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    label: "گروه کاری",
    href: "/work-groups",
    icon: <VectorSquare size={20} />,
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    label: "سازمان",
    href: "/organizations",
    icon: <Network size={20} />,
    allowedRoles: ADMIN_ACCESS,
  },
  {
    label: "تقویم کاری",
    href: "/work-calender",
    icon: <CalendarDays size={20} />,
    allowedRoles: ALL_ACCESS,
  },
  {
    label: "مشاهده دستگاه ها",
    href: "/device-management",
    icon: <Cog size={20} />,
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    label: "مدیریت ادمین ها",
    href: "/admin-management",
    icon: <Puzzle size={20} />,
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    label: "لایسنس نرم‌افزار",
    href: "/license",
    icon: <ShieldCheck size={20} />,
    allowedRoles: SUPER_ADMIN_ONLY,
  },
];