// --- ✅ وظیفه ۴ و ۵: صفحه ثبت درخواست جدید (کانتینر هوشمند) ---

import { useNavigate } from 'react-router-dom';
// (استفاده از مسیرهای نسبی موجود در فایل آپلود شده شما)
import { NewRequestForm } from '../components/newRequestPage/NewRequestForm';
import { type NewRequestFormData } from '../schemas/newRequestSchema';
import { CirclePlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

// ✅ ۱. ایمپورت تقویم میلادی برای تبدیل تاریخ
import gregorian from "react-date-object/calendars/gregorian";
// ✅ رفع خطای TS2304: DateObject ایمپورت شد
import { type DateObject } from "react-multi-date-picker";

// (استفاده از مسیرهای نسبی موجود در فایل آپلود شده شما)
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';
import { useCreateLeaveRequest } from '../hook/useLeaveRequests';
import type { User } from '../types';
// (استفاده از مسیرهای نسبی موجود در فایل آپلود شده شما)
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';


/**
 * صفحه‌ی "درخواست جدید"
 * این کامپوننت والد و کانتینر برای فرم است
 */
const NewRequestPage = () => {
    const navigate = useNavigate();
    const createRequestMutation = useCreateLeaveRequest();
    const isSubmitting = createRequestMutation.isPending;

    const currentUser = useAppSelector(selectUser) as User | null;

    /**
     * ✅ تابع کمکی استاندارد برای تبدیل تاریخ و ساعت محلی به فرمت استاندارد UTC برای دیتابیس
     * این تابع مشکل اختلاف ساعت (Timezone Shift) را حل می‌کند.
     * * @param dateObj آبجکت تاریخ انتخاب شده (شمسی یا میلادی)
     * @param timeStr رشته ساعت (مثلا "08:00")
     * @returns رشته فرمت شده برای SQL اما با زمان UTC (مثلا "2025-05-20 04:30:00")
     */
    const formatToAPIPayload = (dateObj: DateObject, timeStr: string): string => {
        // ۱. تبدیل تاریخ به میلادی (اگر شمسی باشد)
        const gDate = dateObj.convert(gregorian);

        // ۲. تجزیه ساعت و دقیقه
        const [hours, minutes] = timeStr.split(':').map(Number);

        // ۳. ساخت آبجکت Date جاوااسکریپت
        // نکته کلیدی: این Date با Timezone مرورگر کاربر (ایران) ساخته می‌شود
        const localDate = new Date(
            gDate.year,
            gDate.month.number - 1, // ماه‌های JS از 0 شروع می‌شوند
            gDate.day,
            hours,
            minutes,
            0 // ثانیه
        );

        // ۴. تبدیل به ISO String (که خودکار ساعت را به UTC تبدیل می‌کند)
        // مثال: اگر ایران باشیم (GMT+3:30) و ساعت 08:00 باشد، خروجی می‌شود T04:30:00Z
        const isoString = localDate.toISOString();

        // ۵. فرمت نهایی برای بک‌اند (حذف T و Z برای سازگاری با فیلد Timestamp دیتابیس‌های SQL)
        // خروجی نهایی: "2025-05-20 04:30:00"
        return isoString.slice(0, 19).replace('T', ' ');
    };

    /**
     * این تابع داده‌های نهایی و اعتبارسنجی شده را از فرم دریافت می‌کند
     * و برای ارسال به API آماده می‌کند.
     */
    const handleCreateRequest = (data: NewRequestFormData) => {
        console.log('داده‌های اعتبارسنجی شده از فرم:', data);

        if (!currentUser?.employee) {
            toast.error("خطای سیستمی: اطلاعات کاربری یافت نشد.");
            return;
        }

        // --- ✅✅✅ منطق اصلاح شده: مدیریت دقیق Timezone ---
        if (!data.startDate || !data.endDate) {
            toast.error("تاریخ شروع و پایان الزامی است.");
            return;
        }

        // تعیین ساعت‌ها بر اساس حالت تمام وقت یا پاره وقت
        let startTimePart = '00:00'; // ساعت شروع روز کاری
        let endTimePart = '23:59';   // ساعت پایان روز کاری

        if (!data.isFullDay) {
            // در حالت پاره وقت، از ساعت‌های ورودی استفاده می‌کنیم
            startTimePart = data.startTime || '08:00';
            endTimePart = data.endTime || '17:00';
        }

        // ساخت تاریخ و زمان نهایی برای API با تبدیل به UTC
        const apiPayload = {
            leave_type_id: data.requestType!.id as number,

            // ✅ استفاده از تابع جدید برای هندل کردن اختلاف ساعت
            start_time: formatToAPIPayload(data.startDate, startTimePart),
            end_time: formatToAPIPayload(data.endDate, endTimePart),

            reason: data.description || undefined,
        };

        // لاگ برای دیباگ: باید ببینید ساعت‌ها نسبت به ورودی کاربر 3:30 عقب‌تر هستند (اگر در ایران هستید)
        // این یعنی درست کار می‌کند چون بک‌اند آن را UTC در نظر می‌گیرد.
        console.log('آبجکت آماده برای ارسال به API (UTC converted):', apiPayload);

        // --- پایان منطق جدید ---

        createRequestMutation.mutate(apiPayload, {
            onSuccess: () => {
                navigate('/requests');
            },
            onError: (error) => {
                if ((error as AxiosError<{ message?: string }>)?.response?.status === 409) {
                    toast.warn((error as AxiosError<{ message?: string }>).response?.data?.message || "درخواست شما با درخواست دیگری همپوشانی دارد.");
                }
                else if ((error as AxiosError)?.response?.status === 422) {
                    console.error("خطاهای اعتبارسنجی بک‌اند:", (error as AxiosError).response?.data);
                    const timeErrors = (error as AxiosError<{ errors?: { start_time?: string[] } }>)?.response?.data?.errors?.start_time;
                    if (timeErrors && timeErrors.some(e => e.includes("after or equal to now"))) {
                        toast.error("تاریخ شروع نمی‌تواند در گذشته باشد.");
                    } else {
                        toast.error("خطای اعتبارسنجی: فرمت تاریخ ارسالی توسط سرور پذیرفته نشد.");
                    }
                }
            }
        });
    };

    const handleCancel = () => {
        navigate('/requests');
    };

    // (گارد دسترسی - بدون تغییر)
    if (!currentUser || !currentUser.employee) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertTitle>خطای دسترسی</AlertTitle>
                <AlertDescription>
                    شما برای ثبت درخواست جدید، ابتدا باید پروفایل کارمندی (Employee) داشته باشید.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl shadow-sm md:mr-4  mx-auto"> {/* ✅ ریسپانسیو: padding مناسب */}
            <h2 className=" flex gap-2 items-center text-xl font-bold text-right mb-6 pb-4 border-b border-borderL dark:border-borderD dark:text-backgroundL-500">
                <CirclePlus size={20} />
                ثبت درخواست جدید
            </h2>

            <NewRequestForm
                currentUser={currentUser}
                onSubmit={handleCreateRequest}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default NewRequestPage;