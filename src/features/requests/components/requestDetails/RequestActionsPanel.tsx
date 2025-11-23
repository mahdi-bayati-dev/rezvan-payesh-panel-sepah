// features/requests/components/requestDetails/RequestActionsPanel.tsx

import type { LeaveRequest } from "@/features/requests/types";
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import Textarea from '@/components/ui/Textarea';
import { X, Check } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

const statusOptions: SelectOption[] = [
    { id: 'approved', name: 'تایید شده' },
    { id: 'rejected', name: 'رد شده' },
    { id: 'pending', name: 'در انتظار' },
];

interface RequestActionsPanelProps {
    request: LeaveRequest;
    status: SelectOption | null;
    onStatusChange: (value: SelectOption | null) => void;
    response: string;
    onResponseChange: (value: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
    onExport: () => void;
    isSubmitting: boolean;

    // ✅ [جدید] پراپ برای دریافت پیام خطا از والد
    errorMessage?: string | null;
}

export const RequestActionsPanel = ({
    request,
    status,
    onStatusChange,
    response,
    onResponseChange,
    onConfirm,
    onCancel,
    // onExport,
    isSubmitting,
    errorMessage, // دریافت خطا
}: RequestActionsPanelProps) => {


    // وضعیت فعلی درخواست را چک می‌کنیم تا اگر نهایی شده، فرم غیرفعال شود
    const isProcessed = request.status === 'approved' || request.status === 'rejected';

    return (
        <div className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
            <h3 className="text-lg font-bold text-right mb-6 dark:text-backgroundL-500">گزینه ها</h3>
            <div className="flex flex-col gap-y-6">

                <SelectBox
                    label="تغییر وضعیت"
                    placeholder={isProcessed ? "وضعیت قبلاً ثبت شده" : "انتخاب کنید"}
                    options={statusOptions}
                    value={status}
                    onChange={onStatusChange}
                    disabled={isSubmitting || isProcessed}
                />

                <Textarea
                    label="پاسخ ادمین / دلیل رد (برای رد کردن الزامی است)"
                    placeholder={isProcessed ? "پاسخ قبلاً ثبت شده" : "توضیحات خود را بنویسید..."}
                    rows={5}
                    value={response}
                    onChange={(e) => onResponseChange(e.target.value)}
                    disabled={isSubmitting || isProcessed}
                    // ✅ [جدید] اتصال پیام خطا به کامپوننت Textarea
                    // این باعث می‌شود کادر قرمز شود و پیام خطا زیر آن نمایش داده شود
                    error={errorMessage || undefined}
                />

   

                <div className="flex gap-4">
                    <button
                        onClick={onConfirm}
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