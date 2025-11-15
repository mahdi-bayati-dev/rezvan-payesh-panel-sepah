// src/features/dashboard/routes/DashboardPage.tsx

import { useState, useMemo, type ReactNode } from "react";
// ایمپورت آیکون‌های مورد نیاز
import {
  UserCheck,
  Clock,
  UserX,
  CalendarOff,
  Briefcase,
  Users,
} from "lucide-react";

// ایمپورت React Query
import { useQuery } from '@tanstack/react-query';

// ایمپورت‌های مربوط به تاریخ و API
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  fetchDashboardData,
  type DashboardData,
  type SummaryStats,
  // [✅ اصلاح مسیر ایمپورت]
} from "@/features/dashboard/api/dashboardApi";

import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import StatCard from "@/features/dashboard/components/StatCard";
import AttendanceChart from "@/features/dashboard/components/AttendanceChart";
import { Spinner } from "@/components/ui/Spinner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";

type TimeFilter = "daily" | "weekly" | "monthly";

// ====================================================================
// تعریف نوع داده برای کارت‌های آمار (همان ساختار SummaryStats)
// ====================================================================

interface StatConfig {
  key: keyof SummaryStats;
  title: string;
  linkText: string;
  icon: ReactNode;
  variant: 'success' | 'warning' | 'danger' | 'info';
}


// پیکربندی ثابت کارت‌ها
const statsConfig: StatConfig[] = [
  {
    key: "total_present",
    title: "کارمندان حاضر",
    linkText: "مشاهده",
    icon: <UserCheck size={20} className="text-green-500" />,
    variant: 'success',
  },
  {
    key: "total_lateness",
    title: "تاخیرهای امروز",
    linkText: "مشاهده",
    icon: <Clock size={20} className="text-yellow-500" />,
    variant: 'warning',
  },
  {
    key: "total_early_departure",
    title: "خروج زودهنگام",
    linkText: "مشاهده",
    icon: <Briefcase size={20} className="text-orange-500" />,
    variant: 'danger',
  },
  {
    key: "total_on_leave",
    title: "مرخصی‌های امروز",
    linkText: "مشاهده",
    icon: <CalendarOff size={20} className="text-indigo-500" />,
    variant: 'info',
  },
  {
    key: "total_absent",
    title: "کارمندان غایب", // (Not Available)
    linkText: "مشاهده",
    icon: <UserX size={20} className="text-red-500" />,
    variant: 'danger',
  },
  {
    key: "total_employees_scoped",
    title: "کل کارمندان تحت پوشش",
    linkText: "مشاهده لیست",
    icon: <Users size={20} className="text-blue-500" />,
    variant: 'info',
  },
];


// ====================================================================
// کامپوننت اصلی DashboardPage
// ====================================================================

const DashboardPage = () => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("daily");

  const [selectedDate, setSelectedDate] = useState<DateObject | null>(
    new DateObject({ calendar: persian, locale: persian_fa })
  );

  // [استفاده از React Query]
  // ۱. کلید کوئری: شامل متغیرهای وابسته است تا با تغییر آنها، کوئری رفچ شود.
  const queryKey = ['dashboardData', activeFilter, selectedDate ? selectedDate.format("YYYY-MM-DD") : null];

  // ۲. هوک useQuery
  const { data, isLoading, isError, error, refetch } = useQuery<DashboardData, Error>({
    queryKey: queryKey,
    // تابع واکشی: از ماژول API که بهینه‌سازی کردیم استفاده می‌کند
    queryFn: () => fetchDashboardData(selectedDate, activeFilter),
    // [نکته بهینه]: اگر فیلتر روزانه است، داده‌ها را 5 دقیقه stale نگه می‌داریم
    staleTime: activeFilter === 'daily' ? 1000 * 60 * 5 : 1000 * 60 * 10,
    // [نکته UX]: اگر توکن وجود نداشت، React Query خطا می‌دهد و مدیریت آن در Interceptor انجام می‌شود.
    enabled: true, // همیشه فعال است
  });

  // ====================================================================
  // منطق آماده‌سازی داده‌های چارت (تبدیل ساختار API به ساختار Recharts)
  // ====================================================================
  // [استفاده از useMemo]: برای جلوگیری از re-calculation غیرضروری
  const chartData = useMemo(() => {
    return data?.live_organization_stats
      .flatMap(parentOrg => parentOrg.children_stats)
      .map(childStat => ({
        name: childStat.org_name,
        value: childStat.count
      })) || [];
  }, [data]);


  return (
    <div className="flex flex-col gap-4">
      {/* پیام خطا در صورت وجود */}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle>خطای حیاتی</AlertTitle>
          <AlertDescription>
            خطا در بارگذاری اطلاعات: {(error as Error).message}. لطفا صفحه را رفرش کنید یا شبکه ای خود را بررسی کنید.
          </AlertDescription>
        </Alert>
      )}

      <div className="p-4 bg-backgroundL-500 dark:bg-backgroundD flex flex-col gap-6 rounded-2xl border border-borderL dark:border-borderD transition-colors">
        {/* هدر شامل فیلترهای زمان و تاریخ */}
        <DashboardHeader
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        <span className="my-2 flex items-center">
          <span className="h-px flex-1 bg-borderL/50 dark:bg-borderD/50"></span>
        </span>

        {/* ======================= کارت‌های آمار ======================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-2">
          {isLoading ? (
            // اسکلت لودینگ برای کارت‌ها
            statsConfig.map((stat) => (
              <div key={stat.key} className="flex flex-col gap-4 rounded-2xl border border-borderL bg-secondaryL/50 p-4 dark:border-borderD dark:bg-secondaryD/50 h-28">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/4 self-end" />
              </div>
            ))
          ) : data ? (
            // نمایش داده‌های واقعی
            statsConfig.map((stat) => (
              <StatCard
                key={stat.key}
                title={stat.title}
                // استفاده از Type Assertion برای اطمینان از دسترسی به کلید
                value={data.summary_stats[stat.key as keyof SummaryStats] || 0}
                linkText={stat.linkText}
                icon={stat.icon}
                onLinkClick={() => console.log(`Clicked on ${stat.title} | API Key: ${stat.key}`)}
              />
            ))
          ) : (
            // اگر داده‌ای نبود (مثلاً به دلیل خطای API)
            <p className="col-span-full text-center text-muted-foregroundL dark:text-muted-foregroundD">
              داده‌های آماری در حال حاضر در دسترس نیست.
            </p>
          )}
        </div>
      </div>

      {/* ======================= چارت آمار سازمان‌ها ======================= */}
      <div className="bg-backgroundL-500 dark:bg-backgroundD p-6 rounded-2xl border border-borderL dark:border-borderD transition-colors">
        <h3 className="text-lg font-bold text-foregroundL dark:text-foregroundD mb-4 text-right">
          آمار تفکیکی حاضرین بر اساس سازمان
        </h3>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <Spinner text="در حال بارگذاری نمودار سازمان‌ها..." size="lg" />
          </div>
        ) : (
          <AttendanceChart data={chartData} />
        )}
      </div>
      {/* [نکته UX]: دکمه دستی Refetch برای زمانی که کاربر می‌خواهد داده‌ها را آپدیت کند */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="bg-primaryL/10 text-primaryL dark:bg-primaryD/10 dark:text-primaryD px-4 py-2 rounded-lg text-sm hover:bg-primaryL/20 transition-colors disabled:opacity-50"
        >
          {isLoading ? <Spinner size="xs" text="در حال به‌روزرسانی..." /> : "به‌روزرسانی دستی آمار"}
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;