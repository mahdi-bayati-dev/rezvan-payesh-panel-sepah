// src/features/dashboard/components/AttendanceChart.tsx

import { useEffect, useState, useMemo, type CSSProperties } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileBarChart2 } from 'lucide-react';
import { toPersianDigits } from "@/features/dashboard/api/dashboardApi";

interface ChartDataPoint {
  name: string;
  value: number;
}

interface AttendanceChartProps {
  data: ChartDataPoint[];
}

// اضافه کردن مقادیر پیش‌فرض برای تولتیپ
const initialThemeColors = {
  bar: '#4f46e5',
  grid: '#e1e6ef',
  tick: '#64748b',
  text: '#1e293b',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e2e8f0',
  tooltipColor: '#0f172a'
};

const AttendanceChart = ({ data }: AttendanceChartProps) => {
  const [themeColors, setThemeColors] = useState(initialThemeColors);

  // سینک کردن رنگ‌ها با تم (Dark/Light)
  useEffect(() => {
    const updateColors = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      const rootStyles = getComputedStyle(document.documentElement);
      
      setThemeColors({
        bar: rootStyles.getPropertyValue(isDarkMode ? '--color-primaryD' : '--color-primaryL').trim() || initialThemeColors.bar,
        grid: rootStyles.getPropertyValue(isDarkMode ? '--color-borderD' : '--color-borderL').trim() || initialThemeColors.grid,
        tick: rootStyles.getPropertyValue(isDarkMode ? '--color-muted-foregroundD' : '--color-muted-foregroundL').trim() || initialThemeColors.tick,
        text: rootStyles.getPropertyValue(isDarkMode ? '--color-foregroundD' : '--color-foregroundL').trim() || initialThemeColors.text,
        
        // تنظیم دقیق رنگ‌های تولتیپ برای رفع مشکل خوانایی در دارک مود
        tooltipBg: rootStyles.getPropertyValue(isDarkMode ? '--color-secondaryD' : '--color-backgroundL-500').trim() || (isDarkMode ? '#1e293b' : '#ffffff'),
        tooltipBorder: rootStyles.getPropertyValue(isDarkMode ? '--color-borderD' : '--color-borderL').trim() || initialThemeColors.tooltipBorder,
        tooltipColor: rootStyles.getPropertyValue(isDarkMode ? '--color-foregroundD' : '--color-foregroundL').trim() || initialThemeColors.tooltipColor,
      });
    };

    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const hasData = useMemo(() => data && data.length > 0 && data.some(d => d.value > 0), [data]);

  // استایل تولتیپ با استفاده از متغیرهای State برای پشتیبانی کامل از دارک مود
  const tooltipStyle: CSSProperties = {
    borderRadius: '0.75rem',
    backgroundColor: themeColors.tooltipBg, // استفاده از رنگ داینامیک
    borderColor: themeColors.tooltipBorder, // استفاده از رنگ داینامیک
    color: themeColors.tooltipColor, // استفاده از رنگ داینامیک
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    direction: 'rtl',
    fontFamily: 'inherit',
    padding: '8px 12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    textAlign: 'right',
    zIndex: 50 // اطمینان از نمایش روی سایر المان‌ها
  };

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] bg-secondaryL/10 dark:bg-secondaryD/10 rounded-2xl border-2 border-dashed border-borderL/50 dark:border-borderD/50">
        <div className="bg-backgroundL p-4 rounded-full mb-4 dark:bg-backgroundD shadow-sm">
          <FileBarChart2 className="h-8 w-8 text-muted-foregroundL dark:text-muted-foregroundD opacity-50" />
        </div>
        <p className="text-base font-bold text-foregroundL dark:text-foregroundD">
          داده‌ای برای نمایش موجود نیست
        </p>
        <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD mt-1">
          هنوز اطلاعاتی برای بازه زمانی انتخاب شده ثبت نشده است.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 350 }} className="font-persian">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
        >
          <CartesianGrid stroke={themeColors.grid} strokeDasharray="3 3" vertical={false} opacity={0.6} />
          
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            interval={0}
            tick={{ fill: themeColors.tick, fontSize: 11, dy: 10, fontFamily: 'inherit' }}
            stroke={themeColors.grid}
            tickLine={false}
            axisLine={{ stroke: themeColors.grid, strokeWidth: 1 }}
          />
          
          <YAxis
            tick={{ fill: themeColors.tick, fontSize: 12, fontFamily: 'inherit' }}
            stroke={themeColors.grid}
            tickFormatter={(val) => toPersianDigits(val)}
            axisLine={false}
            tickLine={false}
            width={40}
          />

          <Tooltip
            cursor={{ fill: themeColors.grid, opacity: 0.15, radius: 4 }}
            contentStyle={tooltipStyle}
            // استایل لیبل (عنوان تولتیپ) باید با رنگ متن تم هماهنگ باشد
            labelStyle={{ fontWeight: 'bold', marginBottom: '0.5rem', color: themeColors.text }}
            // استایل آیتم‌ها (مقادیر)
            itemStyle={{ color: themeColors.bar }}
            formatter={(value: number) => [`${toPersianDigits(value)} نفر`, 'تعداد حاضرین']}
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