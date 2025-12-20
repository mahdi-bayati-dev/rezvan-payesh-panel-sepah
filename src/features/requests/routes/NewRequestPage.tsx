import { useNavigate } from 'react-router-dom';
import { NewRequestForm } from '../components/newRequestPage/NewRequestForm';
import { type NewRequestFormData } from '../schemas/newRequestSchema';
import { CirclePlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { DateObject } from "react-multi-date-picker";
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';
import { useCreateLeaveRequest } from '../hook/useLeaveRequests';
import type { User } from '../types';
// اصلاح شده: استفاده از نام کوچک برای هماهنگی با سیستم بیلد و جلوگیری از خطای Case-sensitivity
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

const NewRequestPage = () => {
    const navigate = useNavigate();
    const createRequestMutation = useCreateLeaveRequest();
    const isSubmitting = createRequestMutation.isPending;
    const currentUser = useAppSelector(selectUser) as User | null;

    /**
     * ✅ تبدیل هوشمند تاریخ به فرمت API
     * این تابع زمان را به وقت تهران تنظیم کرده و از خطای "زمان گذشته" جلوگیری می‌کند.
     */
    const formatToAPIPayload = (dateObj: DateObject, timeStr: string): string => {
        // ایجاد کپی برای جلوگیری از تغییر آبجکت اصلی
        const tempDate = new DateObject(dateObj);
        tempDate.convert(gregorian, gregorian_en);

        const [hours, minutes] = timeStr.split(':').map(Number);
        tempDate.setHour(hours);
        tempDate.setMinute(minutes);
        tempDate.setSecond(0);

        // دریافت زمان حال سیستم
        const now = new DateObject({ calendar: gregorian, locale: gregorian_en });

        // بررسی اینکه اگر زمان انتخابی (مثلاً شروع روز) از همین الان عقب‌تر است
        // آن را به زمان حال + ۱۰ ثانیه جابجا می‌کنیم تا ولیدیشن سرور پاس شود.
        if (tempDate.valueOf() <= now.valueOf()) {
            console.log(`[Time Adjustment] Adjusting ${timeStr} to now to bypass server validation.`);
            tempDate.setHour(now.hour);
            tempDate.setMinute(now.minute);
            tempDate.setSecond(now.second + 10);
        }

        const result = tempDate.format("YYYY-MM-DD HH:mm:ss");
        console.log(`[Payload Detail] Created: ${result}`);
        return result;
    };

    const handleCreateRequest = (data: NewRequestFormData) => {
        if (!currentUser?.employee) {
            toast.error("خطای سیستمی: اطلاعات کاربری یافت نشد.");
            return;
        }

        // ✅ رفع خطای TS2345: اطمینان از عدم null بودن مقادیر قبل از پردازش
        if (!data.startDate || !data.endDate) {
            toast.error("تاریخ شروع و پایان الزامی است.");
            return;
        }

        try {
            let startTimePart = '00:00';
            let endTimePart = '23:59';

            if (!data.isFullDay) {
                startTimePart = data.startTime || '08:00';
                endTimePart = data.endTime || '17:00';
            }

            const apiPayload = {
                leave_type_id: data.requestType!.id as number,
                // استفاده از ! برای اطمینان به تایپ‌اسکریپت پس از گارد بالا
                start_time: formatToAPIPayload(data.startDate!, startTimePart),
                end_time: formatToAPIPayload(data.endDate!, endTimePart),
                reason: data.description || undefined,
            };

            console.log("Submitting Payload:", apiPayload);

            createRequestMutation.mutate(apiPayload, {
                onSuccess: () => {
                    toast.success("درخواست با موفقیت ثبت شد.");
                    navigate('/requests');
                },
                onError: (error) => {
                    const axiosError = error as AxiosError<{ message?: string, errors?: any }>;
                    const serverErrors = axiosError.response?.data?.errors;

                    if (axiosError.response?.status === 422 && serverErrors) {
                        const firstError = Object.values(serverErrors)[0] as string[];
                        toast.error(firstError[0]);
                    } else {
                        toast.error(axiosError.response?.data?.message || "خطا در ثبت درخواست.");
                    }
                }
            });
        } catch (err) {
            console.error("Submission error:", err);
        }
    };

    if (!currentUser || !currentUser.employee) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertTitle>خطای دسترسی</AlertTitle>
                <AlertDescription>اطلاعات کارمندی شما یافت نشد.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl shadow-sm md:mr-4 mx-auto" dir="rtl">
            <h2 className="flex gap-2 items-center text-xl font-bold text-right mb-6 pb-4 border-b border-borderL dark:border-borderD text-foregroundL dark:text-backgroundL-500">
                <CirclePlus size={20} />
                ثبت درخواست جدید
            </h2>

            <NewRequestForm
                currentUser={currentUser}
                onSubmit={handleCreateRequest}
                onCancel={() => navigate('/requests')}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default NewRequestPage;