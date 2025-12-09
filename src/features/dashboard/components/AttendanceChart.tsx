// src/features/dashboard/components/AttendanceChart.tsx

import { useEffect, useState, useMemo, type CSSProperties } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FileBarChart2 } from 'lucide-react';
import { toPersianDigits } from "@/features/dashboard/api/dashboardApi";

interface ChartDataPoint {
  name: string;
  value: number;
}

interface AttendanceChartProps {
  data: ChartDataPoint[];
}

// اینترفیس برای نگهداری رنگ‌های استخراج شده از CSS Variables
interface ChartThemeColors {
  bar: string;
  grid: string;
  tick: string;
  text: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}

// مقادیر اولیه خالی تا زمانی که useEffect اجرا شود و رنگ‌های واقعی را بخواند
const initialThemeColors: ChartThemeColors = {
  bar: '',
  grid: '',
  tick: '',
  text: '',
  tooltipBg: '',
  tooltipBorder: '',
  tooltipText: ''
};

const AttendanceChart = ({ data }: AttendanceChartProps) => {
  const [themeColors, setThemeColors] = useState<ChartThemeColors>(initialThemeColors);
  const [isMounted, setIsMounted] = useState(false);

  // بررسی وجود دیتا برای نمایش وضعیت خالی
  const hasData = useMemo(() => {
    return data && data.length > 0 && data.some(d => d.value > 0);
  }, [data]);

  // سینک کردن رنگ‌ها با متغیرهای CSS تعریف شده در index.css
  useEffect(() => {
    setIsMounted(true);

    const updateColors = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const isDarkMode = document.documentElement.classList.contains('dark');

      // تابع کمکی برای خواندن متغیر CSS
      const getVar = (variableName: string) => rootStyles.getPropertyValue(variableName).trim();

      setThemeColors({
        // رنگ میله‌ها: رنگ اصلی برند
        bar: isDarkMode
          ? getVar('--color-primaryD')
          : getVar('--color-primaryL'),

        // رنگ خطوط گرید: رنگ بوردرها
        grid: isDarkMode
          ? getVar('--color-borderD')
          : getVar('--color-borderL'),

        // رنگ اعداد محورها: رنگ متن‌های کم‌رنگ
        tick: isDarkMode
          ? getVar('--color-muted-foregroundD')
          : getVar('--color-muted-foregroundL'),

        // رنگ متن اصلی (مثلاً عنوان تولتیپ)
        text: isDarkMode
          ? getVar('--color-foregroundD')
          : getVar('--color-foregroundL'),

        // پس‌زمینه تولتیپ:
        // در لایت: سفید مطلق (backgroundL-500)
        // در دارک: رنگ ثانویه (secondaryD) برای تمایز با پس‌زمینه اصلی
        tooltipBg: isDarkMode
          ? getVar('--color-secondaryD')
          : getVar('--color-backgroundL-500'),

        // بوردر تولتیپ
        tooltipBorder: isDarkMode
          ? getVar('--color-borderD')
          : getVar('--color-borderL'),

        // رنگ متن داخل تولتیپ
        tooltipText: isDarkMode
          ? getVar('--color-foregroundD')
          : getVar('--color-foregroundL')
      });
    };

    // فراخوانی اولیه
    updateColors();

    // گوش دادن به تغییرات کلاس 'dark' روی تگ html برای تغییر لحظه‌ای تم
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // استایل اختصاصی تولتیپ بر اساس متغیرهای استخراج شده
  const tooltipStyle: CSSProperties = {
    borderRadius: '0.75rem', // معادل rounded-xl
    backgroundColor: themeColors.tooltipBg,
    borderColor: themeColors.tooltipBorder,
    color: themeColors.tooltipText,
    borderWidth: '1px',
    borderStyle: 'solid',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // معادل shadow-md
    padding: '8px 12px',
    textAlign: 'right',
    direction: 'rtl',
    fontFamily: 'inherit',
    zIndex: 50,
  };

  // اگر هنوز رنگ‌ها لود نشده‌اند یا کامپوننت مانت نشده، چیزی نمایش نده (برای جلوگیری از پرش رنگ)
  if (!isMounted || !themeColors.bar) {
    return <div className="h-[350px] w-full animate-pulse bg-secondaryL/10 dark:bg-secondaryD/10 rounded-2xl" />;
  }

  // وضعیت "داده‌ای موجود نیست"
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] w-full bg-secondaryL/10 dark:bg-secondaryD/10 rounded-2xl border-2 border-dashed border-borderL/50 dark:border-borderD/50 transition-colors duration-300">
        <div className="bg-backgroundL-500 dark:bg-backgroundD p-4 rounded-full mb-4 shadow-sm transition-colors duration-300">
          <FileBarChart2 className="h-8 w-8 text-muted-foregroundL dark:text-muted-foregroundD opacity-50" />
        </div>
        <p className="text-base font-bold text-foregroundL dark:text-foregroundD transition-colors duration-300">
          داده‌ای برای نمایش موجود نیست
        </p>
        <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD mt-1 transition-colors duration-300">
          هنوز اطلاعاتی برای بازه زمانی انتخاب شده ثبت نشده است.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 350 }} className="font-persian" dir="ltr">
      {/* نکته: dir="ltr" برای Recharts ضروری است تا محور Y سمت چپ باشد 
        اما محتوای تولتیپ و محور X را با فونت فارسی و راست‌چین مدیریت می‌کنیم.
      */}
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
        >
          <CartesianGrid
            stroke={themeColors.grid}
            strokeDasharray="3 3"
            vertical={false}
            opacity={0.5}
          />

          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            interval={0}
            tick={{
              fill: themeColors.tick,
              fontSize: 11,
              dy: 10,
              fontFamily: 'inherit' // ارث‌بری فونت وزیرمتن
            }}
            stroke={themeColors.grid}
            tickLine={false}
            axisLine={{ stroke: themeColors.grid, strokeWidth: 1 }}
          />

          <YAxis
            tick={{
              fill: themeColors.tick,
              fontSize: 12,
              fontFamily: 'inherit'
            }}
            stroke={themeColors.grid}
            tickFormatter={(val) => toPersianDigits(val)}
            axisLine={false}
            tickLine={false}
            width={40}
          />

          <Tooltip
            cursor={{ fill: themeColors.grid, opacity: 0.1, radius: 4 }}
            contentStyle={tooltipStyle}
            wrapperStyle={{ outline: 'none' }}
            // استایل لیبل (عنوان تولتیپ)
            labelStyle={{
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: themeColors.text
            }}
            // استایل آیتم‌ها (مقادیر)
            itemStyle={{ color: themeColors.bar }}
            formatter={(value: number) => [
              <span key="val" className="font-medium text-foregroundL dark:text-foregroundD">
                {`${toPersianDigits(value)} نفر`}
              </span>,
              'تعداد حاضرین'
            ]}
            labelFormatter={(label) => `سازمان: ${label}`}
          />

          <Bar
            dataKey="value"
            fill={themeColors.bar}
            radius={[6, 6, 0, 0]}
            barSize={data.length > 10 ? 24 : 48}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;