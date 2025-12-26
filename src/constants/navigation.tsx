// src/constants/navigation.tsx

import {
  LayoutDashboard,      // ستاد فرماندهی
  CalendarDays,         // برنامه ریزی خدمتی
  Network,              // ساختار سازمانی
  Mails,                // مکاتبات و ابلاغیه‌ها
  ShieldCheck,          // امنیت و لایسنس
  UserCheck,            // وضعیت انفرادی
  ClipboardCheck,       // بررسی وضعیت (بجای گزارش)
  // Settings2,            // پیکربندی سامانه
  Users2,               // مدیریت پرسنل
  Fingerprint,          // کنترل تردد/تجهیزات
  Landmark,             // یگان‌ها/سازمان
  ScanEye,              // بازبینی تصاویر
  Layers                // الگوها و گروه‌های کاری
} from "lucide-react";
import { ALL_ACCESS, ADMIN_ACCESS, SUPER_ADMIN_ONLY } from "./roles";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: string[];
  requiresEmployee?: boolean;
}

/**
 * ناوبری اصلی سامانه با ادبیات نظامی و ستادی
 * تمامی عناوین برای همخوانی با محیط‌های رسمی و پادگانی بازنویسی شده‌اند.
 */
export const mainNavItems: NavItem[] = [
  {
    label: "رصد و پایش (داشبورد)",
    href: "/",
    icon: <LayoutDashboard size={20} />,
    allowedRoles: ALL_ACCESS,
  },
  {
    label: "وضعیت انفرادی (پروفایل)",
    href: "/my-profile",
    icon: <UserCheck size={20} />,
    allowedRoles: ALL_ACCESS,
    requiresEmployee: true, // مخصوص پرسنل وظیفه یا کادر دارای پرونده
  },
  {
    label: "امور ابلاغی و درخواست‌ها",
    href: "/requests",
    icon: <Mails size={20} />,
    allowedRoles: ALL_ACCESS,
  },
  {
    label: "بررسی وضعیت و گزارش‌ها",
    href: "/reports",
    icon: <ClipboardCheck size={20} />,
    allowedRoles: ALL_ACCESS,
  },
  {
    label: "الگوهای خدمتی",
    href: "/work-patterns",
    icon: <Layers size={20} />,
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    label: "رده‌های کاری",
    href: "/work-groups",
    icon: <Users2 size={20} />,
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    label: "ساختار یگانی (سازمان)",
    href: "/organizations",
    icon: <Landmark size={20} />,
    allowedRoles: ADMIN_ACCESS,
  },
  {
    label: "برنامه زمان‌بندی (تقویم)",
    href: "/work-calender",
    icon: <CalendarDays size={20} />,
    allowedRoles: ALL_ACCESS,
  },
  {
    label: "مدیریت پایانه‌ها (دستگاه‌ها)",
    href: "/device-management",
    icon: <Fingerprint size={20} />,
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    label: "فرماندهی کاربران (ادمین‌ها)",
    href: "/admin-management",
    icon: <Network size={20} />,
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    label: "اعتبارنامه (لایسنس)",
    href: "/license",
    icon: <ShieldCheck size={20} />,
    allowedRoles: SUPER_ADMIN_ONLY,
  },
  {
    label: "تایید هویت و تصاویر",
    href: "/confirm-photos/pending-images",
    icon: <ScanEye size={20} />,
    allowedRoles: ADMIN_ACCESS,
  },
];