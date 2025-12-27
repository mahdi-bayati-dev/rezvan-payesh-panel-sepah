import { useState, useMemo, type ReactNode } from "react";
import {
  ShieldCheck,
  Timer,
  ShieldX,
  LogOut,
  Users,
  Target,
  ExternalLink,
  FileCheck,
  RefreshCw
} from "lucide-react";

import { useQuery } from '@tanstack/react-query';
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import {
  fetchDashboardData,
  isAdminDashboard,
  isUserDashboard,
  type DashboardResponse,
  type AdminSummaryStats,
  type UserDashboardData
} from "@/features/dashboard/api/dashboardApi";

import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import StatCard from "@/features/dashboard/components/StatCard";
import AttendanceChart from "@/features/dashboard/components/AttendanceChart";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";

type TimeFilter = "daily" | "weekly" | "monthly";

// ====================================================================
// توابع کمکی (Utility)
// ====================================================================

/**
 * تبدیل اعداد به فارسی برای حفظ یکپارچگی بصری در گزارشات نظامی
 */
const toPersianDigits = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null) return "۰";
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

// ====================================================================
// پیکربندی کارت‌های آماری با تم نظامی
// ====================================================================

interface StatConfig<T> {
  key: keyof T;
  title: string;
  icon: ReactNode;
  variant: 'success' | 'warning' | 'danger' | 'info';
  linkText?: string;
}

const adminStatsConfig: StatConfig<AdminSummaryStats>[] = [
  {
    key: "total_present",
    title: "نیروهای موجود (پای کار)",
    icon: <ShieldCheck size={20} className="text-green-600 dark:text-green-400" />,
    variant: 'success'
  },
  {
    key: "total_lateness",
    title: "تاخیر در الحاق",
    icon: <Timer size={20} className="text-yellow-600 dark:text-yellow-400" />,
    variant: 'warning'
  },
  {
    key: "total_early_departure",
    title: "تعجیل در ترخیص",
    icon: <LogOut size={20} className="text-orange-600 dark:text-orange-400" />,
    variant: 'danger'
  },
  {
    key: "total_absent",
    title: "خارج از رده / غایب",
    icon: <ShieldX size={20} className="text-red-600 dark:text-red-400" />,
    variant: 'danger'
  },
  {
    key: "total_employees_scoped",
    title: "آمار کل قوای انسانی",
    icon: <Users size={20} className="text-blue-600 dark:text-blue-400" />,
    variant: 'info'
  },
];

const userStatsConfig: StatConfig<UserDashboardData>[] = [
  {
    key: "absences_count",
    title: "عدم حضور در پست (ماه)",
    icon: <ShieldX size={20} className="text-red-500 dark:text-red-400" />,
    variant: 'danger'
  },
  {
    key: "leaves_approved_count",
    title: "مرخصی‌های ابلاغ شده",
    icon: <FileCheck size={20} className="text-green-500 dark:text-green-400" />,
    variant: 'success'
  },
  {
    key: "early_exits_count",
    title: "ترخیص پیش از موعد",
    icon: <ExternalLink size={20} className="text-orange-500 dark:text-orange-400" />,
    variant: 'warning'
  },
];

const DashboardPage = () => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("daily");
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(
    new DateObject({ calendar: persian, locale: persian_fa })
  );

  const queryKey = ['dashboardData', activeFilter, selectedDate?.format("YYYY-MM-DD")];

  const { data, isLoading, isError, error, refetch } = useQuery<DashboardResponse, Error>({
    queryKey: queryKey,
    queryFn: () => fetchDashboardData(selectedDate, activeFilter),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const isAdmin = data ? isAdminDashboard(data) : false;
  const isUser = data ? isUserDashboard(data) : false;

  const chartData = useMemo(() => {
    if (!data || !isAdminDashboard(data) || !data.live_organization_stats) return [];
    return data.live_organization_stats
      .flatMap(parentOrg => parentOrg.children_stats || [])
      .map(childStat => ({
        name: childStat.org_name,
        value: childStat.count
      }));
  }, [data]);

  const headerLabel = useMemo(() => {
    if (isAdmin) return "گزارش وضعیت آماری رزم یگان";
    if (isUser) return "کارنامه عملکرد انفرادی (ماه جاری)";
    return "مرکز کنترل و فرماندهی";
  }, [isAdmin, isUser]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-36 rounded-2xl border border-borderL p-5 bg-secondaryL/20 dark:border-borderD dark:bg-secondaryD/10 flex flex-col justify-between animate-pulse">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-16" />
            </div>
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <Alert variant="destructive" className="col-span-full my-4 w-full">
          <AlertTitle>خطا در برقراری ارتباط با مرکز داده</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      );
    }

    if (isAdmin && isAdminDashboard(data!)) {
      return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {adminStatsConfig.map((stat) => (
              <StatCard
                key={stat.key}
                title={stat.title}
                value={toPersianDigits(data.summary_stats[stat.key] ?? 0)}
                variant={stat.variant}
                linkText={stat.linkText}
                icon={stat.icon}
                onLinkClick={
                  stat.linkText
                    ? () => console.log(`Intelligence Detail: ${stat.key}`)
                    : undefined
                }
              />
            ))}
          </div>

          <div className="bg-backgroundL-500 dark:bg-backgroundD p-6 lg:p-8 rounded-3xl border border-borderL dark:border-borderD shadow-sm min-h-[450px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h3 className="text-xl font-bold text-foregroundL dark:text-foregroundD flex items-center gap-3">
                <div className="p-2 bg-primaryL/10 dark:bg-primaryD/10 rounded-xl">
                  <Target className="w-6 h-6 text-primaryL dark:text-primaryD" />
                </div>
                مانیتورینگ عملیاتی یگان‌های تابعه
              </h3>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 text-xs sm:text-sm bg-secondaryL/80 hover:bg-secondaryL dark:bg-secondaryD dark:text-secondary-foregroundD px-4 py-2 rounded-xl transition-all hover:shadow-md active:scale-95"
              >
                <RefreshCw size={14} />
                به‌روزرسانی داده‌های رزم
              </button>
            </div>
            <AttendanceChart data={chartData} />
          </div>
        </div>
      );
    }

    if (isUser && isUserDashboard(data!)) {
      return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {userStatsConfig.map((stat) => (
            <StatCard
              key={stat.key}
              title={stat.title}
              value={toPersianDigits(data[stat.key] ?? 0)}
              variant={stat.variant}
              linkText={stat.linkText}
              icon={stat.icon}
              onLinkClick={
                stat.linkText
                  ? () => console.log(`Personal Log: ${stat.key}`)
                  : undefined
              }
            />
          ))}

          <div className="col-span-full mt-2 p-5 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl backdrop-blur-sm">
            <p className="text-sm md:text-base text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              پرسنل گرامی، آمار فوق مربوط به انضباط خدمتی شما در <strong>ماه جاری</strong> می‌باشد.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 sm:p-4">
      <div className="w-full p-6 bg-backgroundL-500 dark:bg-backgroundD rounded-3xl border border-borderL dark:border-borderD shadow-sm">
        <DashboardHeader
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          hideFilters={true}
          hideDatePicker={true}
          infoLabel={headerLabel}
        />

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-borderL/80 to-transparent dark:via-borderD/80" />

        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardPage;