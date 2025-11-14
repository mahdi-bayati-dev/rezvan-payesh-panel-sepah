// features/requests/components/requestDetails/RequestActionsPanel.tsx

// ۱. [اصلاح حرفه‌ای] تایپ ورودی از Request (Mock) به LeaveRequest (API) تغییر کرد
import type { LeaveRequest } from "@/features/requests/types";
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import Textarea from '@/components/ui/Textarea';
import { Printer, X, Check, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';

// ۲. [اصلاح حرفه‌ای] گزینه‌های وضعیت اکنون با مقادیر واقعی API مطابقت دارند
const statusOptions: SelectOption[] = [
    { id: 'approved', name: 'تایید شده' },
    { id: 'rejected', name: 'رد شده' },
    { id: 'pending', name: 'در انتظار' }, // (ممکن است نخواهید "در انتظار" قابل انتخاب باشد)
];

interface RequestActionsPanelProps {
    request: LeaveRequest; // <-- تایپ اصلاح شد

    // پراپ‌های مربوط به وضعیت (Status)
    status: SelectOption | null;
    onStatusChange: (value: SelectOption | null) => void;

    // پراپ‌های مربوط به توضیحات/پاسخ ادمین
    response: string;
    onResponseChange: (value: string) => void;

    // پراپ‌های مربوط به دکمه‌ها
    onConfirm: () => void; // این تابع توسط والد (DetailPage) ارائه می‌شود
    onCancel: () => void;
    onExport: () => void;
    isSubmitting: boolean; // برای غیرفعال کردن دکمه‌ها
}

export const RequestActionsPanel = ({
    request,
    status,
    onStatusChange,
    response,
    onResponseChange,
    onConfirm,
    onCancel,
    onExport,
    isSubmitting,
}: RequestActionsPanelProps) => {

    const navigate = useNavigate();
    const handleGoToSettings = () => {
        navigate('/requests/export-settings');
    };

    // ۳. [اصلاح حرفه‌ای]
    // وضعیت فعلی درخواست را چک می‌کنیم. اگر "تایید شده" یا "رد شده" باشد،
    // فرم پردازش (تغییر وضعیت و پاسخ ادمین) باید غیرفعال شود.
    const isProcessed = request.status === 'approved' || request.status === 'rejected';

    return (
        <div className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
            <h3 className="text-lg font-bold text-right mb-6 dark:text-backgroundL-500">گزینه ها</h3>
            <div className="flex flex-col gap-y-6">

                {/* ۴. اتصال SelectBox به پراپ‌های والد */}
                <SelectBox
                    label="تغییر وضعیت"
                    placeholder={isProcessed ? "وضعیت قبلاً ثبت شده" : "انتخاب کنید"}
                    options={statusOptions}
                    value={status}
                    onChange={onStatusChange}
                    // اگر در حال ارسال بود یا قبلا پردازش شده، غیرفعال کن
                    disabled={isSubmitting || isProcessed}
                />

                <Textarea
                    label="پاسخ ادمین / دلیل رد (اختیاری)"
                    placeholder={isProcessed ? "پاسخ قبلاً ثبت شده" : "توضیحات خود را بنویسید..."}
                    rows={5}
                    value={response}
                    onChange={(e) => onResponseChange(e.target.value)}
                    disabled={isSubmitting || isProcessed}
                />

                <div className="flex items-center gap-2 transition-all">
                    <button
                        onClick={handleGoToSettings}
                        aria-label="تنظیمات خروجی گزارش"
                        className=" border border-borderL rounded-2xl p-2 cursor-pointer hover:bg-blue hover:text-backgroundL-500 dark:border-borderD dark:text-backgroundL-500"
                        disabled={isSubmitting} // دکمه تنظیمات همیشه فعال است
                    >
                        <Settings2 />
                    </button>
                    <button
                        onClick={onExport}
                        disabled={isSubmitting}
                        className="w-full flex items-center cursor-pointer justify-center gap-2 bg-secondaryL hover:bg-blue hover:text-backgroundL-500 dark:bg-secondaryD text-secondary-foregroundL dark:text-secondary-foregroundD px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                    >
                        <Printer size={18} />
                        خروجی
                    </button>
                </div>

                {/* دکمه ها */}
                <div className="flex gap-4">
                    <button
                        onClick={onConfirm}
                        // اگر در حال ارسال بود یا قبلا پردازش شده، غیرفعال کن
                        disabled={isSubmitting || isProcessed}
                        className="flex-1 flex items-center cursor-pointer justify-center gap-2 bg-primaryL text-white hover:bg-successD-foreground px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 disabled:bg-gray-400"
                    >
                        {isSubmitting ? (
                            <Spinner size="sm" />
                        ) : (
                            <>
                                <Check size={18} />
                                {isProcessed ? "ثبت شده" : "ثبت پاسخ"}
                            </>
                        )}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1 flex cursor-pointer items-center justify-center gap-2 hover:bg-destructiveL text-backgroundD border border-borderL px-1 py-1 rounded-xl text-sm font-medium disabled:opacity-50 dark:text-backgroundL-500"
                    >
                        <X size={18} />
                        بازگشت
                    </button>
                </div>
            </div>
        </div>
    );
};