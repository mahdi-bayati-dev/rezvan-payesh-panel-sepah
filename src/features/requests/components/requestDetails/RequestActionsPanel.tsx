import type { Request } from "@/features/requests/types";
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import Textarea from '@/components/ui/Textarea';
import { Printer, X, Check, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// داده‌های فیک برای وضعیت (بدون تغییر)
const mockStatuses: SelectOption[] = [
    { id: 'stat1', name: 'تایید شده' },
    { id: 'stat2', name: 'رد شده' },
    { id: 'stat3', name: 'در حال بررسی' },
];

// ✅ ۳. تعریف Props جدید برای کامپوننت کنترل‌شده
interface RequestActionsPanelProps {
    request: Request;

    // پراپ‌های مربوط به وضعیت (Status)
    status: SelectOption | null;
    onStatusChange: (value: SelectOption | null) => void;

    // پراپ‌های مربوط به توضیحات/پاسخ ادمین
    response: string;
    onResponseChange: (value: string) => void;

    // پراپ‌های مربوط به دکمه‌ها
    onConfirm: () => void;
    onCancel: () => void;
    onExport: () => void;
    isSubmitting: boolean; // برای غیرفعال کردن دکمه‌ها
}

export const RequestActionsPanel = ({
    //   request,
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
    // ✅ ۳. تابع برای رفتن به صفحه تنظیمات
    const handleGoToSettings = () => {
        navigate('/requests/export-settings');
    };


    return (
        <div className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
            <h3 className="text-lg font-bold text-right mb-6 dark:text-backgroundL-500">گزینه ها</h3>
            <div className="flex flex-col gap-y-6">

                {/* ۴. اتصال SelectBox به پراپ‌های والد */}
                <SelectBox
                    label="وضعیت پاسخ"
                    placeholder="انتخاب کنید"
                    options={mockStatuses}
                    value={status}
                    onChange={onStatusChange}
                    disabled={isSubmitting} // در زمان ارسال غیرفعال شود
                />

                {/* ✅ ۵. اضافه کردن کامپوننت Textarea */}
                <Textarea
                    label="پاسخ ادمین (اختیاری)"
                    placeholder="توضیحات خود را برای این درخواست بنویسید..."
                    rows={5}
                    value={response}
                    onChange={(e) => onResponseChange(e.target.value)}
                    disabled={isSubmitting}
                />

                {/* ✅ ۶. اضافه کردن آیکون به دکمه‌ها */}
                <div className="flex items-center gap-2 transition-all">

                    <button
                        onClick={handleGoToSettings} // <--- اتصال onClick
                        aria-label="تنظیمات خورجی گزارش"
                        className=" border border-borderL rounded-2xl p-2 cursor-pointer hover:bg-blue hover:text-backgroundL-500 dark:border-borderD dark:text-backgroundL-500"
                        disabled={isSubmitting} // دکمه تنظیمات هم غیرفعال شود
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


                <div className="flex gap-4">
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center cursor-pointer justify-center gap-2 bg-primaryL text-white hover:bg-successD-foreground px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                    >
                        <Check size={18} />
                        تایید
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1 flex cursor-pointer items-center justify-center gap-2 hover:bg-destructiveL text-backgroundD border border-borderL px-1 py-1 rounded-xl text-sm font-medium disabled:opacity-50 dark:text-backgroundL-500"
                    >
                        <X size={18} />
                        لغو
                    </button>

                </div>
            </div>
        </div>
    );
};