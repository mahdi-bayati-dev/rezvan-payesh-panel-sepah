
// نوع داده برای هر لاگ فعالیت
export interface ActivityLog {
  id: string;
  employee: {
    name: string;
    avatarUrl?: string; // آدرس آواتار (اختیاری)
    employeeId: string; // شماره پرسنلی
  };
  activityType: 'entry' | 'exit' | 'delay' | 'haste'; // نوع فعالیت
  trafficArea: string; // ناحیه تردد
  date: string; // تاریخ (بهتر است در عمل از Date یا timestamp استفاده شود)
  time: string; // زمان
}

// نوع برای گزینه‌های فیلتر
export interface FilterOption {
  id: string | number;
  name: string;
}
