// src/features/dashboard/components/AttendanceChart.tsx

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AttendanceChartProps {
  data: { name: string; value: number }[];
}

// کامنت: یک آبجکت برای نگهداری رنگ‌های تم تعریف می‌کنیم
const initialThemeColors = {
  bar: '#181b5b',
  grid: '#e1e6ef',
  tick: '#0e131b',
};

const AttendanceChart = ({ data }: AttendanceChartProps) => {
  // کامنت: از useState برای مدیریت داینامیک رنگ‌ها استفاده می‌کنیم
  const [themeColors, setThemeColors] = useState(initialThemeColors);

  useEffect(() => {
    // کامنت: این تابع با بررسی کلاس dark روی تگ <html>، رنگ‌های مناسب را از متغیرهای CSS می‌خواند
    const updateColors = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      const rootStyles = getComputedStyle(document.documentElement);

      setThemeColors({
        bar: rootStyles.getPropertyValue(isDarkMode ? '--color-primaryD' : '--color-primaryL').trim(),
        grid: rootStyles.getPropertyValue(isDarkMode ? '--color-borderD' : '--color-borderL').trim(),
        tick: rootStyles.getPropertyValue(isDarkMode ? '--color-muted-foregroundD' : '--color-foregroundL').trim(),
      });
    };

    updateColors(); // یکبار در اولین رندر اجرا می‌شود

    // کامنت: با استفاده از MutationObserver به تغییرات تم گوش می‌دهیم تا نمودار همیشه به‌روز باشد
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect(); // کامنت: در زمان unmount کامپوننت، observer را پاک می‌کنیم
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        {/* کامنت: رنگ خطوط گرید از state خوانده می‌شود */}
        <CartesianGrid stroke={themeColors.grid} strokeDasharray="3 3" vertical={false} />
        {/* کامنت: رنگ لیبل‌های محورها از state خوانده می‌شود */}
        <XAxis dataKey="name" tick={{ fill: themeColors.tick, fontSize: 12 }} stroke={themeColors.grid} />
        <YAxis tick={{ fill: themeColors.tick, fontSize: 12 }} stroke={themeColors.grid} />
        {/* کامنت: استایل Tooltip نیز با متغیرهای CSS تنظیم شد */}
        <Tooltip
          cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
          contentStyle={{
            backgroundColor: 'var(--color-backgroundL-500)',
            borderColor: 'var(--color-borderL)',
            color: 'var(--color-foregroundL)',
            borderRadius: '0.5rem',
          }}
        />
        {/* کامنت: رنگ میله‌های نمودار از state خوانده می‌شود */}
        <Bar dataKey="value" fill={themeColors.bar} name="کارمندان حاضر" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;