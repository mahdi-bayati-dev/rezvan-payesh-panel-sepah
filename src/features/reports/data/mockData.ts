// در این فایل داده‌های فیک برای جدول گزارش تعریف شده‌اند
// تا زمانی که API آماده شود، از این داده‌ها استفاده می‌کنیم

import type { ActivityLog, FilterOption } from "@/features/reports/types/index";

export const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    employee: {
      name: "مهدی بیاتی",
      employeeId: "0123456789",
      avatarUrl: "https://placehold.co/40x40/E2E8F0/64748B?text=MB",
    },
    activityType: "entry",
    trafficArea: "بخش ۱",
    date: "03 مهرماه 1404",
    time: "7:00",
  },
  {
    id: "2",
    employee: {
      name: "سارا رضایی",
      employeeId: "0123456788",
      avatarUrl: "https://placehold.co/40x40/E0F2FE/0891B2?text=SR",
    },
    activityType: "entry",
    trafficArea: "بخش 2",
    date: "03 مهرماه 1404",
    time: "6:59",
  },
  {
    id: "3",
    employee: {
      name: "علی احمدی",
      employeeId: "0123456787",
      avatarUrl: "https://placehold.co/40x40/FEFCE8/A16207?text=AA",
    },
    activityType: "exit",
    trafficArea: "بخش 3",
    date: "03 مهرماه 1404",
    time: "15:00",
  },
  {
    id: "4",
    employee: {
      name: "مریم حسینی",
      employeeId: "0123456786",
      avatarUrl: "https://placehold.co/40x40/FCE7F3/CC258C?text=MH",
    },
    activityType: "delay",
    trafficArea: "بخش 1",
    date: "03 مهرماه 1404",
    time: "7:15",
  },
  {
    id: "5",
    employee: {
      name: "رضا قاسمی",
      employeeId: "0123456785",
    },
    activityType: "haste",
    trafficArea: "بخش 3",
    date: "03 مهرماه 1404",
    time: "14:45",
  },
  // ... اضافه کردن 15 رکورد دیگر برای تست صفحه‌بندی
  {
    id: "6",
    employee: {
      name: "زهرا نوری",
      employeeId: "0123456784",
      avatarUrl: "https://placehold.co/40x40/ECFDF5/065F46?text=ZN",
    },
    activityType: "entry",
    trafficArea: "بخش 2",
    date: "02 مهرماه 1404",
    time: "7:02",
  },
  {
    id: "7",
    employee: {
      name: "حسین کریمی",
      employeeId: "0123456783",
    },
    activityType: "exit",
    trafficArea: "بخش 1",
    date: "02 مهرماه 1404",
    time: "15:05",
  },
  {
    id: "8",
    employee: {
      name: "فاطمه محمدی",
      employeeId: "0123456782",
      avatarUrl: "https://placehold.co/40x40/EEF2FF/4338CA?text=FM",
    },
    activityType: "delay",
    trafficArea: "بخش 3",
    date: "02 مهرماه 1404",
    time: "7:20",
  },
  {
    id: "9",
    employee: {
      name: "محمد اکبری",
      employeeId: "0123456781",
    },
    activityType: "entry",
    trafficArea: "بخش 1",
    date: "01 مهرماه 1404",
    time: "6:58",
  },
  {
    id: "10",
    employee: {
      name: "نیلوفر صالحی",
      employeeId: "0123456780",
      avatarUrl: "https://placehold.co/40x40/FFFBEB/B45309?text=NS",
    },
    activityType: "haste",
    trafficArea: "بخش 2",
    date: "01 مهرماه 1404",
    time: "14:50",
  },
  {
    id: "11",
    employee: {
      name: "مهدی بیاتی",
      employeeId: "0123456789",
      avatarUrl: "https://placehold.co/40x40/E2E8F0/64748B?text=MB",
    },
    activityType: "exit",
    trafficArea: "بخش 1",
    date: "01 مهرماه 1404",
    time: "15:00",
  },
  {
    id: "12",
    employee: {
      name: "سارا رضایی",
      employeeId: "0123456788",
      avatarUrl: "https://placehold.co/40x40/E0F2FE/0891B2?text=SR",
    },
    activityType: "delay",
    trafficArea: "بخش 2",
    date: "01 مهرماه 1404",
    time: "7:10",
  },
  {
    id: "13",
    employee: {
      name: "علی احمدی",
      employeeId: "0123456787",
      avatarUrl: "https://placehold.co/40x40/FEFCE8/A16207?text=AA",
    },
    activityType: "entry",
    trafficArea: "بخش 3",
    date: "31 شهریور 1404",
    time: "7:00",
  },
  {
    id: "14",
    employee: {
      name: "مریم حسینی",
      employeeId: "0123456786",
      avatarUrl: "https://placehold.co/40x40/FCE7F3/CC258C?text=MH",
    },
    activityType: "exit",
    trafficArea: "بخش 1",
    date: "31 شهریور 1404",
    time: "15:02",
  },
  {
    id: "15",
    employee: {
      name: "رضا قاسمی",
      employeeId: "0123456785",
    },
    activityType: "entry",
    trafficArea: "بخش 3",
    date: "31 شهریور 1404",
    time: "6:55",
  },
  {
    id: "16",
    employee: {
      name: "زهرا نوری",
      employeeId: "0123456784",
      avatarUrl: "https://placehold.co/40x40/ECFDF5/065F46?text=ZN",
    },
    activityType: "haste",
    trafficArea: "بخش 2",
    date: "31 شهریور 1404",
    time: "14:48",
  },
  {
    id: "17",
    employee: {
      name: "حسین کریمی",
      employeeId: "0123456783",
    },
    activityType: "delay",
    trafficArea: "بخش 1",
    date: "30 شهریور 1404",
    time: "7:30",
  },
  {
    id: "18",
    employee: {
      name: "فاطمه محمدی",
      employeeId: "0123456782",
      avatarUrl: "https://placehold.co/40x40/EEF2FF/4338CA?text=FM",
    },
    activityType: "entry",
    trafficArea: "بخش 3",
    date: "30 شهریور 1404",
    time: "7:01",
  },
  {
    id: "19",
    employee: {
      name: "محمد اکبری",
      employeeId: "0123456781",
    },
    activityType: "exit",
    trafficArea: "بخش 1",
    date: "30 شهریور 1404",
    time: "15:00",
  },
  {
    id: "20",
    employee: {
      name: "نیلوفر صالحی",
      employeeId: "0123456780",
      avatarUrl: "https://placehold.co/40x40/FFFBEB/B45309?text=NS",
    },
    activityType: "entry",
    trafficArea: "بخش 2",
    date: "30 شهریور 1404",
    time: "7:05",
  },
];

// داده‌های فیک برای فیلترها
export const activityTypeOptions: FilterOption[] = [
  { id: "all", name: "همه فعالیت‌ها" },
  { id: "entry", name: "ورود" },
  { id: "exit", name: "خروج" },
  { id: "delay", name: "تاخیر" },
  { id: "haste", name: "تعجیل" },
];

export const trafficAreaOptions: FilterOption[] = [
  { id: "all", name: "همه ناحیه‌ها" },
  { id: "1", name: "بخش ۱" },
  { id: "2", name: "بخش ۲" },
  { id: "3", name: "بخش ۳" },
];
