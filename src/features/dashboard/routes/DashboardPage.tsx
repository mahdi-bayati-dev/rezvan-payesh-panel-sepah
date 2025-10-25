// src/features/dashboard/routes/DashboardPage.tsx

import { useState, type ReactNode } from "react";
// کامنت: آیکون‌های مورد نیاز از کتابخانه lucide-react ایمپورت شدند
import {
  UserCheck,
  Clock,
  UserX,
  CalendarOff,
  CheckCircle2,
} from "lucide-react";
// کامنت: ایمپورت‌های مورد نیاز برای تاریخ جلالی
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import StatCard from "@/features/dashboard/components/StatCard";
import AttendanceChart from "@/features/dashboard/components/AttendanceChart";

type TimeFilter = "daily" | "weekly" | "monthly";


interface StatCardData {
  title: string;
  value: number | string;
  linkText: string;
  icon: ReactNode;
}


const statsData: StatCardData[] = [
  {
    title: "کارمندان حاضر",
    value: 234,
    linkText: "مشاهده تاریخچه",
    icon: <UserCheck size={20} />,
  },
  {
    title: "تاخیرهای امروز",
    value: 15,
    linkText: "مشاهده تاریخچه",
    icon: <Clock size={20} />,
  },
  {
    title: "کارمندان غایب",
    value: 3,
    linkText: "مشاهده تاریخچه",
    icon: <UserX size={20} />,
  },
  {
    title: "مرخصی‌های امروز",
    value: 5,
    linkText: "مشاهده تاریخچه",
    icon: <CalendarOff size={20} />,
  },
  {
    title: "تکمیل‌های امروز",
    value: 100,
    linkText: "مشاهده تاریخچه",
    icon: <CheckCircle2 size={20} />,
  },
];

const chartData = [
  { name: "بخش ۱", value: 226 },
  { name: "بخش ۲", value: 179 },
  { name: "بخش ۳", value: 50 },
  { name: "بخش ۴", value: 200 },
  { name: "بخش ۵", value: 178 },
  { name: "بخش ۶", value: 199 },
  { name: "بخش ۷", value: 228 },
  { name: "بخش ۸", value: 150 },
  { name: "بخش ۹", value: 231 },
  { name: "بخش ۱۰", value: 120 },
  { name: "بخش ۱۰", value: 138 },
  { name: "بخش ۱۰", value: 148 },
  { name: "بخش ۱۰", value: 138 },
  { name: "بخش ۱۰", value: 180 },
];

const DashboardPage = () => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("daily");


  const [selectedDate, setSelectedDate] = useState<DateObject | null>(
    new DateObject({ calendar: persian, locale: persian_fa })
  );
  


  return (
    <div className="flex flex-col gap-2 ">
      <div className="p-4 bg-backgroundL-500 dark:bg-backgroundD flex flex-col gap-6 rounded-2xl border border-borderL dark:border-borderD">
        <div className="bg-backgroundL-500 dark:bg-backgroundD rounded-2xl">
          <DashboardHeader
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}

            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <span className="my-2 flex items-center">
            <span className="h-px flex-1 bg-borderL/50"></span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
            {statsData.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                linkText={stat.linkText}
                icon={stat.icon} // کامنت: آیکون به عنوان prop به کامپوننت StatCard پاس داده شد
                onLinkClick={() => console.log(`Clicked on ${stat.title}`)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-backgroundL-500 dark:bg-backgroundD p-6 rounded-2xl border border-borderL dark:border-borderD transition-colors">
        <AttendanceChart data={chartData} />
      </div>
    </div>
  );
};

export default DashboardPage;
