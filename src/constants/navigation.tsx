// src/constants/navigation.ts

import { LayoutDashboard, CalendarDays, Clock3, VectorSquare, SquareChartGantt, Cog, Network, Mails, Puzzle, ListCheck } from "lucide-react";   //Users

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
    label: "درخواست‌ها",
    href: "/requests",
    icon: <Mails size={20} />,
  },
  {
    label: "گزارش ها",
    href: "/reports",
    icon: <ListCheck size={20} />,
  },
  {
    label: "الگوی کاری",
    href: "/work-patterns",
    icon: <SquareChartGantt size={20} />,
  },
  {
    label: "گروه کاری",
    href: "/work-group",
    icon: <VectorSquare size={20} />,
  },

  {
    label: "سازمان",
    href: "/organizations",
    icon: <Network size={20} />,
  },
  {
    label: "تقویم کاری",
    href: "/work-calender",
    icon: <CalendarDays size={20} />,
  },
  {
    label: "تاریخچه فعالیت ها",
    href: "/activity-history",
    icon: <Clock3 size={20} />,
  },


  {
    label: "مدیریت دستگاه ها",
    href: "/device-management",
    icon: <Cog size={20} />,
  },
  {
    label: "مدیریت ادمین ها",
    href: "/calendarDays",
    icon: <Puzzle size={20} />,
  },

];