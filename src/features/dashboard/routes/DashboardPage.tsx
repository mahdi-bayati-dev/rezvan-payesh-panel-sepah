// src/features/dashboard/routes/DashboardPage.tsx

import { useState, useMemo, type ReactNode } from "react";
import {
  UserCheck,
  Clock,
  UserX,
  CalendarOff,
  Briefcase,
  Users,
  BarChart3
} from "lucide-react";

import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUserRoles } from "@/store/slices/authSlice";
import { ROLES } from "@/constants/roles";

import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import {
  fetchDashboardData,
  type DashboardData,
  type SummaryStats,
} from "@/features/dashboard/api/dashboardApi";

import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import StatCard from "@/features/dashboard/components/StatCard";
import AttendanceChart from "@/features/dashboard/components/AttendanceChart";
import { Spinner } from "@/components/ui/Spinner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";

type TimeFilter = "daily" | "weekly" | "monthly";

// پیکربندی کارت‌های آماری
interface StatConfig {
  key: keyof SummaryStats;
  title: string;
  linkText: string;
  icon: ReactNode;
  variant: 'success' | 'warning' | 'danger' | 'info';
}

const statsConfig: StatConfig[] = [
  {
    key: "total_present",
    title: "حاضرین امروز",
    linkText: "مشاهده",
    icon: <UserCheck size={20} className="text-green-600 dark:text-green-400" />,
    variant: 'success',
  },
  {
    key: "total_lateness",
    title: "تاخیرها",
    linkText: "مشاهده",
    icon: <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />,
    variant: 'warning',
  },
  {
    key: "total_early_departure",
    title: "تعجیل خروج",
    linkText: "مشاهده",
    icon: <Briefcase size={20} className="text-orange-600 dark:text-orange-400" />,
    variant: 'danger',
  },
  {
    key: "total_on_leave",
    title: "مرخصی روزانه",
    linkText: "مشاهده",
    icon: <CalendarOff size={20} className="text-indigo-600 dark:text-indigo-400" />,
    variant: 'info',
  },
  {
    key: "total_absent",
    title: "غایبین / بدون شیفت",
    linkText: "مشاهده",
    icon: <UserX size={20} className="text-red-600 dark:text-red-400" />,
    variant: 'danger',
  },
  {
    key: "total_employees_scoped",
    title: "کل پرسنل",
    linkText: "مشاهده",
    icon: <Users size={20} className="text-blue-600 dark:text-blue-400" />,
    variant: 'info',
  },
];

const DashboardPage = () => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("daily");
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(
    new DateObject({ calendar: persian, locale: persian_fa })
  );

  // دریافت نقش کاربر برای مدیریت نمایش
  const userRoles = useAppSelector(selectUserRoles);

  // کلید کوئری یکتا
  const queryKey = ['dashboardData', activeFilter, selectedDate?.format("YYYY-MM-DD")];

  const { data, isLoading, isError, error, refetch } = useQuery<DashboardData, Error>({
    queryKey: queryKey,
    queryFn: () => fetchDashboardData(selectedDate, activeFilter),
    staleTime: 1000 * 60 * 2, // کش ۲ دقیقه‌ای
    refetchOnWindowFocus: true 
  });

  // ====================================================================
  // 1. آماده‌سازی داده‌های نمودار (با ایمنی کامل)
  // ====================================================================
  const chartData = useMemo(() => {
    if (!data?.live_organization_stats) return [];
    
    return data.live_organization_stats
      // [پچ امنیتی برای L2]:
      // ممکن است children_stats نال باشد، با || [] جلوی کرش را می‌گیریم.
      .flatMap(parentOrg => parentOrg.children_stats || [])
      .map(childStat => ({
        name: childStat.org_name,
        value: childStat.count
      }));
  }, [data]);

  // ====================================================================
  // 2. لاجیک نمایش سکشن نمودار
  // ====================================================================
  const showChartSection = useMemo(() => {
    if (isLoading) return true; // در حال لودینگ اسکلت نشان می‌دهیم

    // اگر کاربر فقط ادمین L3 است، نمودار سازمانی (که خالیست) را نشان نده
    const isL3Only = userRoles.includes(ROLES.ADMIN_L3) && 
                     !userRoles.includes(ROLES.ADMIN_L2) && 
                     !userRoles.includes(ROLES.SUPER_ADMIN);
    
    if (isL3Only) return false;

    return true;
  }, [isLoading, userRoles]);


  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* کانتینر بالا: فیلترها و کارت‌ها */}
      <div className="p-5 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl border border-borderL dark:border-borderD shadow-sm">
        <DashboardHeader
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        
        <div className="my-4 h-px bg-borderL/60 dark:bg-borderD/60" />

        {/* گرید کارت‌ها */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {isLoading ? (
            statsConfig.map((stat) => (
              <div key={stat.key} className="h-32 rounded-2xl border border-borderL p-4 bg-secondaryL/20 dark:border-borderD">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-full mt-auto" />
              </div>
            ))
          ) : isError ? (
             <Alert variant="destructive" className="col-span-full">
              <AlertTitle>خطای دریافت اطلاعات</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          ) : data ? (
            statsConfig.map((stat) => (
              <StatCard
                key={stat.key}
                title={stat.title}
                value={data.summary_stats[stat.key] ?? 0} 
                linkText={stat.linkText}
                icon={stat.icon}
                onLinkClick={() => console.log(`Maps to: ${stat.key}`)}
              />
            ))
          ) : null}
        </div>
      </div>

      {/* کانتینر پایین: نمودار (مشروط) */}
      {showChartSection && (
        <div className="bg-backgroundL-500 dark:bg-backgroundD p-6 rounded-2xl border border-borderL dark:border-borderD shadow-sm min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primaryL dark:text-primaryD" />
              آمار تفکیکی سازمان‌ها
            </h3>
            <button 
              onClick={() => refetch()} 
              disabled={isLoading}
              className="text-xs bg-secondaryL hover:bg-secondaryL/80 dark:bg-secondaryD dark:text-secondary-foregroundD px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "در حال بروزرسانی..." : "بروزرسانی نمودار"}
            </button>
          </div>

          {isLoading ? (
             <div className="flex items-center justify-center h-[300px]">
                <Spinner size="lg" text="در حال ترسیم نمودار..." />
             </div>
          ) : (
            <AttendanceChart data={chartData} />
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;