// src/features/dashboard/components/AttendanceChart.tsx

import { useEffect, useState, useMemo, type CSSProperties } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileBarChart2 } from 'lucide-react';

interface ChartDataPoint {
  name: string;
  value: number;
}

interface AttendanceChartProps {
  data: ChartDataPoint[];
}

const initialThemeColors = {
  bar: '#4f46e5',
  grid: '#e1e6ef',
  tick: '#64748b',
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
      });
    };

    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const hasData = useMemo(() => data && data.length > 0 && data.some(d => d.value > 0), [data]);

  // استایل تولتیپ برای خوانایی بهتر
  const tooltipStyle: CSSProperties = {
    borderRadius: '0.5rem',
    backgroundColor: 'var(--color-backgroundL-500)',
    borderColor: 'var(--color-borderL)',
    color: 'var(--color-foregroundL)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    direction: 'rtl',
    fontFamily: 'inherit'
  };

  // نمایش وضعیت خالی (وقتی داده‌ای نیست)
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-secondaryL/20 dark:bg-secondaryD/20 rounded-xl border border-dashed border-borderL dark:border-borderD">
        <div className="bg-backgroundL p-4 rounded-full mb-4 dark:bg-backgroundD">
          <FileBarChart2 className="h-8 w-8 text-muted-foregroundL dark:text-muted-foregroundD opacity-50" />
        </div>
        <p className="text-base font-medium text-foregroundL dark:text-foregroundD">
          داده‌ای برای نمایش در نمودار موجود نیست
        </p>
        <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD mt-1">
          هنوز اطلاعات حضور و غیابی برای زیرمجموعه‌ها ثبت نشده است.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid stroke={themeColors.grid} strokeDasharray="3 3" vertical={false} />
          
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            interval={0}
            tick={{ fill: themeColors.tick, fontSize: 11, dy: 5 }}
            stroke={themeColors.grid}
            tickLine={false}
          />
          
          <YAxis
            tick={{ fill: themeColors.tick, fontSize: 12 }}
            stroke={themeColors.grid}
            tickFormatter={(val) => Math.floor(val).toString()}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            cursor={{ fill: themeColors.grid, opacity: 0.2 }}
            contentStyle={tooltipStyle}
            labelStyle={{ fontWeight: 'bold', marginBottom: '0.25rem' }}
            formatter={(value: number) => [`${value} نفر`, 'تعداد حاضرین']}
            labelFormatter={(label) => `سازمان: ${label}`}
          />

          <Bar
            dataKey="value"
            fill={themeColors.bar}
            radius={[6, 6, 0, 0]}
            barSize={data.length > 10 ? 20 : 40}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;