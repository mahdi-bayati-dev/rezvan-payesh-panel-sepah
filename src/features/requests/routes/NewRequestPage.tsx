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
     * این تابع داده‌های نهایی و اعتبارسنجی شده را از فرم دریافت می‌کند
     * و برای ارسال به API آماده می‌کند.
     */
    const handleCreateRequest = (data: NewRequestFormData) => {
        console.log('داده‌های اعتبارسنجی شده از فرم:', data);

        if (!currentUser?.employee) {
            toast.error("خطای سیستمی: اطلاعات کاربری یافت نشد.");
            return;
        }

        // --- ✅✅✅ منطق جدید: مدیریت تاریخ شروع، پایان و ساعت‌ها ---
        if (!data.startDate || !data.endDate) {
            toast.error("تاریخ شروع و پایان الزامی است.");
            return;
        }

        // توابع کمکی برای تبدیل تاریخ‌های شمسی به میلادی (YYYY-MM-DD)
        const formatGregorianDate = (dateObject: DateObject): string => {
            // ۱. تبدیل به میلادی
            const gregorianDate = dateObject.convert(gregorian);
            // ۲. ساخت رشته تاریخ با اعداد لاتین
            const year = gregorianDate.year;
            const month = String(gregorianDate.month.number).padStart(2, '0');
            const day = String(gregorianDate.day).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // تعیین ساعت‌ها بر اساس حالت تمام وقت یا پاره وقت
        let startTimePart = '00:00:00'; // پیش‌فرض ساعت شروع روز
        let endTimePart = '23:59:59';   // پیش‌فرض ساعت پایان روز

        if (!data.isFullDay) {
            // در حالت پاره وقت، از ساعت‌های ورودی استفاده می‌کنیم
            // (که به دلیل ولیدیشن اسکیمای جدید، اکنون تضمین شده‌اند که وجود دارند و undefined نیستند)
            // ✅ اصلاح: از || '' استفاده می‌کنیم تا typescript را راضی نگه داریم
            startTimePart = `${data.startTime || '08:00'}:00`;
            endTimePart = `${data.endTime || '17:00'}:00`;
        }

        // ساخت تاریخ و زمان نهایی برای API
        const apiPayload = {
            leave_type_id: data.requestType!.id as number,
            // ترکیب تاریخ شروع میلادی و ساعت شروع
            start_time: `${formatGregorianDate(data.startDate)} ${startTimePart}`,
            // ترکیب تاریخ پایان میلادی و ساعت پایان
            end_time: `${formatGregorianDate(data.endDate)} ${endTimePart}`,
            reason: data.description || undefined,
        };

        // این لاگ باید تاریخ و ساعت‌های صحیح را نشان دهد
        console.log('آبجکت آماده برای ارسال به API:', apiPayload);

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