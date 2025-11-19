import { useNavigate } from 'react-router-dom';
import { CirclePlus } from 'lucide-react';
// مسیرهای Alias استاندارد
import { useCreateLog } from '@/features/reports/hooks/hook';
import { NewReportForm } from '@/features/reports/components/NewActivityRegistration/NewReportForm';
import { type NewReportFormData } from '@/features/reports/Schema/newReportSchema';

function pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
}

export default function NewReportPage() {
    const navigate = useNavigate();
    const createLogMutation = useCreateLog();

    const handleCreateReport = (data: NewReportFormData) => {
        const date = data.date!; 
        const time = data.time; // "07:00"

        // تبدیل تاریخ شمسی به میلادی
        const jsDate = date.toDate(); 
        const year = jsDate.getFullYear();
        const month = pad(jsDate.getMonth() + 1); // ماه در JS از 0 شروع می‌شود
        const day = pad(jsDate.getDate());

        // ✅ استراتژی جدید: ارسال دقیق همان ساعتی که کاربر وارد کرده (بدون UTC شدن)
        // این باعث می‌شود دیتای ثبت دستی دقیقاً مشابه دیتای دوربین AI شود.
        // مثال: کاربر 07:00 انتخاب می‌کند -> ارسال 07:00 -> ذخیره 07:00
        const finalTimestampString = `${year}-${month}-${day} ${time}:00`;

        console.log('🚀 [Local Mode] Sending Payload:', finalTimestampString);

        const apiPayload = {
            employee_id: data.employee!.id,
            event_type: data.event_type,
            timestamp: finalTimestampString,
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
                isSubmitting={createLogMutation.isPending}
            />
        </div>
    );
}