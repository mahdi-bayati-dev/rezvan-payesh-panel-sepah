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
  ListCheck
} from "lucide-react";
import { ALL_ACCESS, ADMIN_ACCESS, SUPER_ADMIN_ONLY } from "./roles";

// ۱. آپدیت اینترفیس برای پشتیبانی از نقش‌ها
export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: string[]; // نقش‌های مجاز برای دیدن این آیتم
}

// ۲. تعریف آیتم‌ها با سطح دسترسی دقیق
export const mainNavItems: NavItem[] = [
  {
    label: "داشبورد",
    href: "/",
    icon: <LayoutDashboard size={20} />,
    // طبق تحلیل: کاربر عادی داشبورد ندارد (چون فقط درخواست، گزارش و تقویم دارد)
    // پس فقط ادمین‌ها می‌بینند.
    allowedRoles: ADMIN_ACCESS,
  },
  {
    label: "درخواست‌ها",
    href: "/requests",
    icon: <Mails size={20} />,
    // همه دسترسی دارند
    allowedRoles: ALL_ACCESS,
  },
  {
    label: "گزارش ها",
    href: "/reports",
    icon: <ListCheck size={20} />,
    // همه دسترسی دارند
    allowedRoles: ALL_ACCESS,
  },
  {
    label: "الگوی کاری",
    href: "/work-patterns",
    icon: <SquareChartGantt size={20} />,
    // [تغییر مهم]: قبلاً ADMIN_ACCESS بود، الان شد SUPER_ADMIN_ONLY
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    label: "گروه کاری",
    href: "/work-groups",
    icon: <VectorSquare size={20} />,
    // طبق درخواست: L2 و L3 دسترسی ندارند، کاربر عادی هم ندارد.
    // پس فقط سوپر ادمین
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    label: "سازمان",
    href: "/organizations",
    icon: <Network size={20} />,
    // کاربر عادی دسترسی ندارد
    allowedRoles: ADMIN_ACCESS,
  },
  {
    label: "تقویم کاری",
    href: "/work-calender",
    icon: <CalendarDays size={20} />,
    // همه دسترسی دارند
    allowedRoles: ALL_ACCESS,
  },
  {
    label: "مشاهده دستگاه ها",
    href: "/device-management",
    icon: <Cog size={20} />,
    // طبق درخواست: L2 و L3 دسترسی ندارند.
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    label: "مدیریت ادمین ها",
    href: "/admin-management",
    icon: <Puzzle size={20} />,
    // طبق درخواست: L2 و L3 دسترسی ندارند.
    allowedRoles: SUPER_ADMIN_ONLY,
  },
];