import { useNavigate } from 'react-router-dom';
import { CirclePlus } from 'lucide-react';
import { useCreateLog, useEmployeeOptions } from '../hooks/hook';
import { NewReportForm } from '../components/NewActivityRegistration/NewReportForm';
import { type NewReportFormData } from '@/features/reports/Schema/newReportSchema';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import gregorian from "react-date-object/calendars/gregorian";

// ۲. [اصلاحیه] تابع کمکی برای اطمینان از دو رقمی بودن (padding)
// این تابع اعداد لاتین تحویل می‌دهد
function pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
}

export default function NewReportPage() {
    const navigate = useNavigate();
    const createLogMutation = useCreateLog();
    const { data: employeeOptions, isLoading: isLoadingEmployees } = useEmployeeOptions();


    const handleCreateReport = (data: NewReportFormData) => {

        // --- بخش تاریخ (بدون تغییر) ---
        const date = data.date!;
        const gregorianDate = date.convert(gregorian);
        const year = gregorianDate.year;
        const month = gregorianDate.month.number;
        const day = gregorianDate.day;
        const time = data.time; // مثلا: "08:00"

        // --- ✅ [اصلاح کلیدی با date-fns-tz] ---

        // ۱. رشته تاریخ و زمان محلی (تهران)
        const localTimestampString = `${year}-${pad(month)}-${pad(day)} ${time}:00`;
        const timeZone = "Asia/Tehran";

        // ۲. تبدیل زمان محلی (تهران) به آبجکت Date استاندارد (در UTC)
        // (این بخش درست بود و تغییر نمی‌کند)
        const utcDate = fromZonedTime(localTimestampString, timeZone);

        // ۳. [اصلاح] فرمت‌دهی آبجکت Date به فرمت دلخواه API
        // به جای: const formattedTimestampUTC = utcDate.toISOString();
        // ما به تابع می‌گوییم:
        // - از آبجکت utcDate استفاده کن
        // - آن را در منطقه زمانی 'UTC' فرمت کن (تا مطمئن شویم 04:30 است نه 08:00)
        // - و از فرمت رشته‌ای 'yyyy-MM-dd HH:mm:ss' استفاده کن
        const formattedTimestampUTC = formatInTimeZone(utcDate, 'UTC', 'yyyy-MM-dd HH:mm:ss');
        // نتیجه: "2025-11-08 04:30:00"

        // --- [پایان اصلاح] ---

        console.log('داده‌های فرم:', data);
        console.log('زمان محلی (تهران):', localTimestampString);
        console.log('زمان ارسالی (فرمت شده برای API):', formattedTimestampUTC);

        const apiPayload = {
            employee_id: data.employee!.id,
            event_type: data.event_type,
            // ۴. استفاده از رشته‌ی فرمت‌شده‌ی جدید
            timestamp: formattedTimestampUTC,
            remarks: data.remarks,
        };

        createLogMutation.mutate(apiPayload, {
            onSuccess: () => {
                navigate('/reports');
            },
        });
    };
    const handleCancel = () => {
        navigate('/reports');
    };

    return (
        <div className="p-6 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl shadow-sm">
            <h2 className=" flex gap-2 items-center text-xl font-bold dark:text-primaryD mb-2">
                <CirclePlus size={20} />
                ثبت تردد دستی
            </h2>

            <NewReportForm
                onSubmit={handleCreateReport}
                onCancel={handleCancel}
                // [رفع خطا ۱۰] - در React Query v5،
                // پراپرتی لودینگ جهش (mutation) از isLoading به isPending تغییر کرده است
                isSubmitting={createLogMutation.isPending}
                employeeOptions={employeeOptions || []}
                isLoadingEmployees={isLoadingEmployees}
            />
        </div>
    );
}