import React, { useState } from 'react'; // ✅ ایمپورت useState
// ✅✅✅ اصلاح مسیردهی: حذف "features" از alias
import { useEditShiftScheduleForm } from '@/features/shift-schedule/hooks/useEditShiftScheduleForm';

// --- کامپوننت‌ها و ابزارهای UI ---
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
// ✅✅✅ اصلاح مسیردهی: استفاده از alias به جای مسیر نسبی
import { ScheduleSlotRow } from '@/features/shift-schedule/components/ScheduleSlotRow';

// --- ✅✅✅ جدید: ایمپورت مودال و فرم جدید ---
import { Dialog } from '@/components/ui/Dialog';
// ✅✅✅ اصلاح مسیردهی: استفاده از alias به جای مسیر نسبی
import { GenerateShiftsForm } from '@/features/shift-schedule/components/GenerateShiftsForm';
// ---

// --- هوک‌ها و تایپ‌ها ---
// ✅✅✅ اصلاح مسیردهی: حذف "features" از alias
import { type WorkPatternBase } from '@/features/shift-schedule/types';

// --- ✅ ایمپورت‌های جدید برای تاریخ شمسی ---
import { Controller } from 'react-hook-form';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
// --- پایان ایمپورت‌های جدید ---

// --- آیکون‌ها ---
import {
    Loader2,
    Save,
    CalendarOff,
    FilePenLine,
    RefreshCw,
    ArrowLeft,
    Edit,
    AlertTriangle,
    CheckCircle2,
    Cpu, // ✅ آیکون جدید برای عملیات
} from 'lucide-react';
import clsx from 'clsx';

// تایپ پراپ‌ها بر اساس خروجی هوک ویرایش
type EditFormHookReturn = ReturnType<typeof useEditShiftScheduleForm>;
interface EditShiftScheduleFormProps extends EditFormHookReturn {
    onCancel: () => void;
    control: EditFormHookReturn['control'];
    availablePatterns: WorkPatternBase[];
}

export const EditShiftScheduleForm: React.FC<EditShiftScheduleFormProps> = ({
    onCancel,
    initialSchedule, // داده‌های اولیه برنامه (شامل اسلات‌ها)
    register,          // (برای فرم اطلاعات عمومی)
    control,           // ✅ دریافت control از پراپ‌ها
    handleSubmit,      // (برای فرم اطلاعات عمومی)
    formErrors,        // (خطاهای فرم اطلاعات عمومی)
    isPending,         // (درحال ذخیره فرم اطلاعات عمومی)
    generalApiError,   // خطای عمومی (هم لود، هم ذخیره)
    isDirty,           // (آیا فرم اطلاعات عمومی تغییر کرده؟)
    onSubmit,          // (تابع ذخیره فرم اطلاعات عمومی)
    availablePatterns,
}) => {

    // --- ✅✅✅ جدید: State برای مدیریت مودال ---
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    // ---

    // --- مدیریت خطای لودینگ (فقط خطای بحرانی) ---
    if (!initialSchedule) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطا در بارگذاری</AlertTitle>
                    <AlertDescription>
                        {generalApiError || "برنامه شیفتی مورد نظر یافت نشد یا خطایی رخ داد."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const slots = initialSchedule.slots || [];

    // --- رندر UI ---
    return (
        <>
            <div
                className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6"
                dir="rtl"
            >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* --- ستون سمت چپ (محتوای اصلی - اسلات‌ها) --- */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold text-foregroundL dark:text-foregroundD">
                                ویرایش برنامه شیفتی:{' '}
                                <span className="text-primaryL dark:text-primaryD">
                                    {initialSchedule.name}
                                </span>
                            </h1>
                        </div>

                        {/* --- ✅✅✅ جدید: کارت عملیات‌ها --- */}
                        <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-xl">
                            <div className="p-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Cpu className="h-6 w-6 text-primaryL dark:text-primaryD" />
                                    <h2 className="text-xl font-semibold text-foregroundL dark:text-foregroundD">
                                        عملیات‌ها
                                    </h2>
                                </div>
                                <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                                    از اینجا می‌توانید شیفت‌های کارمندان را بر اساس این برنامه در
                                    یک بازه زمانی مشخص تولید و تخصیص دهید.
                                </p>
                                <div className="pt-2">
                                    <Button
                                        type="button"
                                        variant="primary" // یا هر variant دیگری که مناسب است
                                        onClick={() => setIsGenerateModalOpen(true)}
                                    >
                                        تولید و تخصیص شیفت‌ها...
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {/* --- پایان کارت عملیات‌ها --- */}


                        {/* کارت اسلات‌ها (بخش ۲ مستندات) */}
                        <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-xl">
                            <div className="p-5 space-y-4">
                                <h2 className="text-xl font-semibold text-foregroundL dark:text-foregroundD">
                                    اسلات‌های چرخه ({initialSchedule.cycle_length_days} روز)
                                </h2>
                                <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                                    برای ویرایش هر روز (تغییر شیفت یا تعریف زمان استثنایی)، از دکمه ویرایش (<Edit className="inline h-4 w-4" />) در همان ردیف استفاده کنید.
                                </p>

                                {slots.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center min-h-[150px] p-4 bg-secondaryL dark:bg-secondaryD rounded-lg text-muted-foregroundL dark:text-muted-foregroundD border border-dashed border-borderL dark:border-borderD">
                                        <CalendarOff className="h-10 w-10 mb-2" />
                                        <span className="font-medium">
                                            اسلاتی برای این برنامه تعریف نشده است.
                                        </span>
                                    </div>
                                ) : (
                                    // جدول اسلات‌ها
                                    <div className="w-full overflow-x-auto border border-borderL dark:border-borderD rounded-lg pb-32">
                                        <div className="min-w-[750px]">
                                            {/* هدر جدول */}
                                            <div
                                                className="grid grid-cols-[80px_3fr_1.5fr_1.5fr_100px] font-medium text-sm text-center bg-gray-100 dark:bg-gray-800 border-b border-borderL dark:border-borderD text-muted-foregroundL dark:text-muted-foregroundD"
                                            >
                                                <div className="p-3 text-center">روز</div>
                                                <div className="p-3 text-right">الگوی کاری (شیفت)</div>
                                                <div className="p-3 text-center">شروع استثنایی</div>
                                                <div className="p-3 text-center">پایان استثنایی</div>
                                                <div className="p-3 text-center">ویرایش</div>
                                            </div>

                                            {/* بدنه جدول */}
                                            <div className="divide-y divide-borderL dark:divide-borderD">
                                                {slots.map((slot) => (
                                                    <div
                                                        key={slot.id}
                                                        className={clsx(
                                                            'grid grid-cols-[80px_3fr_1.5fr_1.5fr_100px] items-start',
                                                            'transition-colors hover:bg-secondaryL/40 dark:hover:bg-secondaryD/30'
                                                        )}
                                                    >
                                                        <ScheduleSlotRow
                                                            slot={slot}
                                                            shiftScheduleId={initialSchedule.id}
                                                            availablePatterns={availablePatterns} // ✅ پاس دادن پراپ دریافتی
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- ستون سمت راست (فرم ویرایش اطلاعات عمومی) --- */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                        {/* این فرم فقط بخش ۱.۴ مستندات را مدیریت می‌کند */}
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6 p-5 bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-xl"
                        >
                            <div className="flex items-center gap-3 border-b border-borderL dark:border-borderD pb-3">
                                <FilePenLine
                                    className="h-6 w-6 text-primaryL dark:text-primaryD"
                                    strokeWidth={2.5}
                                />
                                <h2 className="text-xl font-bold text-foregroundL dark:text-foregroundD">
                                    اطلاعات عمومی
                                </h2>
                            </div>

                            {generalApiError && !generalApiError.includes("بارگذاری") && (
                                <Alert variant="destructive">
                                    <AlertTitle>خطا در ذخیره‌سازی</AlertTitle>
                                    <AlertDescription>{generalApiError}</AlertDescription>
                                </Alert>
                            )}

                            <Input
                                label="نام برنامه"
                                {...register('name')}
                                error={formErrors.name?.message}
                                disabled={isPending}
                            />

                            {/* --- ✅ جایگزینی Input type="date" با Controller --- */}
                            <Controller
                                name="cycle_start_date" // نام فیلد در react-hook-form
                                control={control}      // اتصال به control فرم
                                render={({ field, fieldState: { error } }) => (
                                    <PersianDatePickerInput
                                        label="تاریخ شروع محاسبه چرخه"
                                        placeholder="یک تاریخ انتخاب کنید..."
                                        disabled={isPending} // ✅ استفاده از isPending
                                        error={error?.message} // ✅ نمایش خطا از react-hook-form

                                        // تبدیل مقدار فرم (رشته YYYY-MM-DD) به DateObject
                                        value={field.value ? new DateObject({ date: field.value, calendar: gregorian }) : null}

                                        onChange={(dateObject) => {
                                            if (dateObject) {
                                                // تبدیل DateObject به رشته YYYY-MM-DD میلادی
                                                const gregorianDate = dateObject.convert(gregorian, gregorian_en);
                                                const formattedString = gregorianDate.format("YYYY-MM-DD");
                                                field.onChange(formattedString); // ارسال رشته به react-hook-form
                                            } else {
                                                field.onChange(""); // ارسال رشته خالی در صورت پاک کردن
                                            }
                                        }}
                                    />
                                )}
                            />
                            {/* --- پایان جایگزینی --- */}


                            {/* نمایش طول چرخه (غیرقابل ویرایش) */}
                            <Input
                                label="طول چرخه (روز)"
                                type="number"
                                value={initialSchedule.cycle_length_days}
                                disabled={true}
                                readOnly
                                title="طول چرخه از این فرم قابل ویرایش نیست"
                                className="bg-secondaryL/40 dark:bg-secondaryD/30 focus:ring-0 text-muted-foregroundL dark:text-muted-foregroundD"
                                icon={<RefreshCw className="h-4 w-4 text-muted-foregroundL" />}
                            />

                            {/* --- ✅ نمایش واضح وضعیت "نادیده گرفتن تعطیلات" --- */}
                            <div className="space-y-2 pt-2">
                                <Label className="text-sm font-medium text-muted-foregroundL dark:text-muted-foregroundD">
                                    وضعیت پیروی از تعطیلات
                                </Label>
                                <div className={clsx(
                                    "flex items-center rounded-lg p-3 text-sm font-semibold border",
                                    initialSchedule.ignore_holidays
                                        ? "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200"
                                        : "bg-green-50 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200"
                                )}>
                                    {initialSchedule.ignore_holidays ? (
                                        <>
                                            <AlertTriangle className="ml-2 h-5 w-5" />
                                            <span>این شیفت تعطیلات رسمی را نادیده می‌گیرد.</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="ml-2 h-5 w-5" />
                                            <span>این شیفت از تعطیلات رسمی پیروی می‌کند.</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            {/* --- پایان نمایش وضعیت --- */}


                            <div className="flex flex-col gap-2 pt-4 border-t border-borderL dark:border-borderD">
                                <Button type="submit" disabled={!isDirty || isPending}>
                                    {isPending ? (
                                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="ml-2 h-4 w-4" />
                                    )}
                                    {isPending ? 'در حال ذخیره...' : 'ذخیره اطلاعات عمومی'}
                                </Button>
                                <Button type="button" variant="ghost" onClick={onCancel}>
                                    <ArrowLeft className="ml-2 h-4 w-4" />
                                    بازگشت (لغو)
                                </Button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>

            {/* --- ✅✅✅ جدید: رندر مودال --- */}
            {/* ✅✅✅ رفع خطای TS2322 --- */}
            {/* پراپ onOpenChange به onClose تغییر کرد و مقدار آن اصلاح شد */}
            <Dialog open={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)}>
                <GenerateShiftsForm
                    shiftScheduleId={initialSchedule.id}
                    onClose={() => setIsGenerateModalOpen(false)}
                />
            </Dialog>
        </>
    );
};