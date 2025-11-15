// src/features/dashboard/components/AttendanceChart.tsx

import { useEffect, useState, useMemo, type CSSProperties } from 'react'; // [✅ ایمپورت CSSProperties]
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';

// ====================================================================
// تعریف نوع داده‌های چارت
// ====================================================================
interface ChartDataPoint {
  name: string; // نام سازمان (مثلاً معاونت مالی)
  value: number; // تعداد کارمندان حاضر
}

interface AttendanceChartProps {
  data: ChartDataPoint[]; // داده‌هایی که از DashboardPage آماده‌سازی شده‌اند
}

// ====================================================================
// تعریف رنگ‌های پیش‌فرض و داینامیک
// ====================================================================
const initialThemeColors = {
  bar: '#4f46e5', // رنگ پیش‌فرض آبی ایندیگو
  grid: '#e1e6ef',
  tick: '#0e131b',
};

const AttendanceChart = ({ data }: AttendanceChartProps) => {
  const [themeColors, setThemeColors] = useState(initialThemeColors);

  // منطق به‌روزرسانی رنگ‌ها بر اساس تم (حفظ شده از کد قبلی شما)
  useEffect(() => {
    const updateColors = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      const rootStyles = getComputedStyle(document.documentElement);

      setThemeColors({
        // استفاده از رنگ‌های اولیه/ثانویه تعریف شده در تم
        bar: rootStyles.getPropertyValue(isDarkMode ? '--color-primaryD' : '--color-primaryL').trim() || initialThemeColors.bar,
        grid: rootStyles.getPropertyValue(isDarkMode ? '--color-borderD' : '--color-borderL').trim() || initialThemeColors.grid,
        tick: rootStyles.getPropertyValue(isDarkMode ? '--color-muted-foregroundD' : '--color-foregroundL').trim() || initialThemeColors.tick,
      });
    };

    // [نکته بهینه‌سازی]: یک Event Listener برای تغییرات تم در بدنه `documentElement` کافی است.
    updateColors();

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);


  // ====================================================================
  // منطق نمایش پیام خطا یا نمودار
  // ====================================================================

  // [نکته بهینه]: اگر تعداد سازمان‌ها کمتر از حد مجاز باشد (مثل Admin L3 که [] برمی‌گرداند)
  // و یا مقادیر صفر باشد، پیام مناسب نمایش داده می‌شود.
  const hasData = useMemo(() => data.length > 0 && data.some(d => d.value > 0), [data]);

  if (!hasData) {
    // اگر داده‌ای نبود یا همه مقادیر صفر بودند
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-secondaryL/30 dark:bg-secondaryD/30 rounded-xl p-4">
        <AlertTriangle className="h-10 w-10 text-orange-500 mb-3" />
        <p className="text-lg font-semibold text-foregroundL dark:text-foregroundD mb-1">
          اطلاعات سازمان‌ها موجود نیست.
        </p>
        <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD text-center">
          احتمالاً در حال حاضر کارمندی حاضر نیست یا سطح دسترسی شما برای مشاهده آمار تفکیکی محدود است (Admin L3).
        </p>
      </div>
    );
  }

  // [✅ تعریف یک شیء استایل تمیز و قابل قبول برای TypeScript]
  const tooltipStyle: CSSProperties = {
    padding: '8px 12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    borderRadius: '0.5rem',
    // استفاده از متغیرهای CSS برای تم، که برای TypeScript مشکلی ایجاد نمی‌کند
    backgroundColor: 'var(--color-backgroundL-500)',
    borderColor: 'var(--color-borderL)',
    color: 'var(--color-foregroundL)',
  };


  // ====================================================================
  // رندر نمودار
  // ====================================================================
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        // [بهینه‌سازی] تنظیم حاشیه‌ها برای جلوگیری از بریده شدن لیبل‌های محور X
        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid stroke={themeColors.grid} strokeDasharray="3 3" vertical={false} />

        <XAxis
          dataKey="name"
          // [بهینه‌سازی] اگر تعداد میله‌ها زیاد بود، لیبل‌ها را کج (tilt) می‌کنیم
          angle={data.length > 10 ? -45 : 0}
          textAnchor={data.length > 10 ? "end" : "middle"}
          height={data.length > 10 ? 80 : 40} // افزایش ارتفاع برای نمایش لیبل‌های کج
          interval={0} // نمایش همه لیبل‌ها
          tick={{ fill: themeColors.tick, fontSize: 12 }}
          stroke={themeColors.grid}
        // [نکته UX]: برای نمایش بهتر نام‌های بلند، از re-charts: width=100% استفاده کردیم.
        />
        <YAxis
          tick={{ fill: themeColors.tick, fontSize: 12 }}
          stroke={themeColors.grid}
          // اطمینان از نمایش اعداد صحیح (چون تعداد کارمند است)
          tickFormatter={(value) => Math.round(value).toString()}
          // دامنه چارت از صفر شروع شود
          domain={[0, 'auto']}
        />

        {/* استایل Tooltip برای هماهنگی با تم پروژه */}
        <Tooltip
          cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
          contentStyle={tooltipStyle} // [✅ استفاده از شیء استاندارد tooltipStyle]

          // [نکته تم Dark]: برای مدیریت Dark Mode در Tooltip، از یک کلاس سفارشی در Global CSS
          // یا از `wrapperClassName` استفاده کنید تا متغیرهای CSS درون Tooltip اعمال شوند. 
          // Tooltip به طور پیش‌فرض تم Dark را با متغیرهای CSS شما مدیریت خواهد کرد.

          labelFormatter={(label) => `سازمان: ${label}`} // فرمت دهی به نام سازمان در Tooltip
          formatter={(value: number) => [`${Math.round(value)} نفر`, 'تعداد حاضرین']} // فرمت دهی به مقدار
        />

        {/* میله‌های نمودار */}
        <Bar
          dataKey="value"
          fill={themeColors.bar}
          name="کارمندان حاضر"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;