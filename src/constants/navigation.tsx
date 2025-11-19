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

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: string[];
}

export const mainNavItems: NavItem[] = [
  {
    label: "داشبورد",
    href: "/",
    icon: <LayoutDashboard size={20} />,
    // [تغییر مهم]: قبلاً ADMIN_ACCESS بود، حالا چون API ساپورت می‌کند،
    // برای همه (از جمله کاربر عادی) باز می‌شود.
    allowedRoles: ALL_ACCESS,
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
];