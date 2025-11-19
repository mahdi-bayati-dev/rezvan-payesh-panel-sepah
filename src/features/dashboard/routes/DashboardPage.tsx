// src/features/dashboard/routes/DashboardPage.tsx

import { useState, useMemo, type ReactNode } from "react";
import {
  UserCheck,
  Clock,
  UserX,
  CalendarOff,
  Briefcase,
  Users,
  BarChart3,
  LogOut,
  FileSignature
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
// import { Spinner } from "@/components/ui/Spinner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";

type TimeFilter = "daily" | "weekly" | "monthly";

// ====================================================================
// پیکربندی کارت‌های آماری (Admin & User)
// ====================================================================

interface StatConfig<T> {
  key: keyof T;
  title: string;
  linkText: string;
  icon: ReactNode;
  variant: 'success' | 'warning' | 'danger' | 'info';
}

// ۱. کانفیگ کارت‌های مدیر
const adminStatsConfig: StatConfig<AdminSummaryStats>[] = [
  {
    key: "total_present",
    title: "حاضرین امروز",
    linkText: "لیست حاضرین",
    icon: <UserCheck size={20} className="text-green-600 dark:text-green-400" />,
    variant: 'success',
  },
  {
    key: "total_lateness",
    title: "تاخیرها",
    linkText: "مشاهده جزئیات",
    icon: <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />,
    variant: 'warning',
  },
  {
    key: "total_early_departure",
    title: "تعجیل خروج",
    linkText: "مشاهده لیست",
    icon: <Briefcase size={20} className="text-orange-600 dark:text-orange-400" />,
    variant: 'danger',
  },
  {
    key: "total_on_leave",
    title: "مرخصی روزانه",
    linkText: "لیست مرخصی‌ها",
    icon: <CalendarOff size={20} className="text-indigo-600 dark:text-indigo-400" />,
    variant: 'info',
  },
  {
    key: "total_absent",
    title: "غایبین / بدون شیفت",
    linkText: "بررسی وضعیت",
    icon: <UserX size={20} className="text-red-600 dark:text-red-400" />,
    variant: 'danger',
  },
  {
    key: "total_employees_scoped",
    title: "کل پرسنل",
    linkText: "مدیریت پرسنل",
    icon: <Users size={20} className="text-blue-600 dark:text-blue-400" />,
    variant: 'info',
  },
];

// ۲. کانفیگ کارت‌های کاربر عادی
const userStatsConfig: StatConfig<UserDashboardData>[] = [
  {
    key: "absences_count",
    title: "غیبت‌های ماه جاری",
    linkText: "مشاهده ترددها",
    icon: <UserX size={20} className="text-red-500 dark:text-red-400" />,
    variant: 'danger',
  },
  {
    key: "leaves_approved_count",
    title: "مرخصی‌های تایید شده",
    linkText: "درخواست‌های من",
    icon: <FileSignature size={20} className="text-green-500 dark:text-green-400" />,
    variant: 'success',
  },
  {
    key: "early_exits_count",
    title: "دفعات تعجیل/خروج",
    linkText: "جزئیات کارکرد",
    icon: <LogOut size={20} className="text-orange-500 dark:text-orange-400" />,
    variant: 'warning',
  },
];

// ====================================================================
// کامپوننت اصلی
// ====================================================================

const DashboardPage = () => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("daily");
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(
    new DateObject({ calendar: persian, locale: persian_fa })
  );

  // کلید کوئری برای کش کردن دیتا
  const queryKey = ['dashboardData', activeFilter, selectedDate?.format("YYYY-MM-DD")];

  const { data, isLoading, isError, error, refetch } = useQuery<DashboardResponse, Error>({
    queryKey: queryKey,
    queryFn: () => fetchDashboardData(selectedDate, activeFilter),
    staleTime: 1000 * 60 * 2, // کش ۲ دقیقه
    retry: 1, // فقط یک بار تلاش مجدد در صورت خطا
  });

  // ====================================================================
  // لاجیک تشخیص نوع نمایش (Admin vs User)
  // ====================================================================
  
  const isAdmin = data ? isAdminDashboard(data) : false;
  const isUser = data ? isUserDashboard(data) : false;

  // آماده‌سازی داده‌های نمودار (فقط برای ادمین)
  const chartData = useMemo(() => {
    if (!data || !isAdminDashboard(data) || !data.live_organization_stats) return [];
    
    return data.live_organization_stats
      .flatMap(parentOrg => parentOrg.children_stats || [])
      .map(childStat => ({
        name: childStat.org_name,
        value: childStat.count
      }));
  }, [data]);

  // ====================================================================
  // رندر شرطی محتوا
  // ====================================================================

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl border border-borderL p-4 bg-secondaryL/20 dark:border-borderD">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-full mt-auto" />
            </div>
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <Alert variant="destructive" className="col-span-full">
          <AlertTitle>خطا در دریافت اطلاعات</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      );
    }

    // ------------------ حالت ادمین ------------------
    if (isAdmin && isAdminDashboard(data!)) {
      return (
        <>
          {/* بخش آمار کلی */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {adminStatsConfig.map((stat) => (
              <StatCard
                key={stat.key}
                title={stat.title}
                value={data.summary_stats[stat.key] ?? 0} 
                linkText={stat.linkText}
                icon={stat.icon}
                onLinkClick={() => console.log(`Admin navigate to: ${stat.key}`)}
              />
            ))}
          </div>

          {/* بخش نمودار */}
          <div className="mt-6 bg-backgroundL-500 dark:bg-backgroundD p-6 rounded-2xl border border-borderL dark:border-borderD shadow-sm min-h-[400px] animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primaryL dark:text-primaryD" />
                آمار لحظه‌ای سازمان‌ها
              </h3>
              <button 
                onClick={() => refetch()} 
                className="text-xs bg-secondaryL hover:bg-secondaryL/80 dark:bg-secondaryD dark:text-secondary-foregroundD px-3 py-1.5 rounded-lg transition-colors"
              >
                بروزرسانی نمودار
              </button>
            </div>
            <AttendanceChart data={chartData} />
          </div>
        </>
      );
    }

    // ------------------ حالت کاربر عادی ------------------
    if (isUser && isUserDashboard(data!)) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {userStatsConfig.map((stat) => (
            <StatCard
              key={stat.key}
              title={stat.title}
              value={data[stat.key] ?? 0}
              linkText={stat.linkText}
              icon={stat.icon}
              onLinkClick={() => console.log(`User navigate to: ${stat.key}`)}
            />
          ))}
          
          {/* کارت راهنما یا پیام خوش‌آمدگویی برای کاربر */}
          <div className="col-span-full mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              کاربر گرامی، آمار فوق مربوط به عملکرد شما در <strong>ماه جاری</strong> می‌باشد. برای مشاهده سوابق ماه‌های قبل به بخش "کارکرد من" مراجعه کنید.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* هدر مشترک */}
      <div className="p-5 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl border border-borderL dark:border-borderD shadow-sm">
        <DashboardHeader
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        
        <div className="my-4 h-px bg-borderL/60 dark:bg-borderD/60" />

        {/* محتوای اصلی */}
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardPage;