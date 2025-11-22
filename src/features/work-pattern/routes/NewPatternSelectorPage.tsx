import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { RadioGroup } from '@headlessui/react';
import { NewWeekPatternForm } from "@/features/work-pattern/components/newWorkPattern/NewWeekPatternForm";
import { NewShiftScheduleForm } from "@/features/shift-schedule/components/NewShiftScheduleForm";
import clsx from 'clsx';
import { Calendar, Repeat2, CheckCircle2 } from 'lucide-react'; // آیکون تیک اضافه شد

type PatternType = 'WEEK_PATTERN' | 'SHIFT_SCHEDULE';

// تعریف آپشن‌ها بیرون کامپوننت (چون مقدار ثابتی است و نیاز به رندر مجدد ندارد)
const PATTERN_OPTIONS: { id: PatternType; name: string; description: string; icon: React.ReactNode }[] = [
    {
        id: 'WEEK_PATTERN',
        name: 'الگوی کاری ثابت (هفتگی)',
        description: 'مناسب برای پرسنل اداری با ساعات کاری مشخص (مثلاً شنبه تا چهارشنبه).',
        icon: <Calendar className="h-6 w-6" />
    },
    {
        id: 'SHIFT_SCHEDULE',
        name: 'برنامه شیفتی چرخشی',
        description: 'مناسب برای نگهبانی، پرستاری و شیفت‌های چرخشی (مثلاً ۱۲ ساعت کار، ۲۴ ساعت استراحت).',
        icon: <Repeat2 className="h-6 w-6" />
    },
];

function NewWorkPatternPage() {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState<PatternType>('WEEK_PATTERN');

    const handleSuccess = () => {
        // بازگشت به لیست پس از موفقیت
        navigate('/work-patterns');
    };

    const handleCancel = () => {
        navigate('/work-patterns');
    };

    return (
        <div className=" mx-auto space-y-8" dir="rtl">

            {/* --- هدر صفحه --- */}
            <div className="bg-backgroundL-500 dark:bg-backgroundD rounded-2xl shadow-sm border border-borderL dark:border-borderD p-6 md:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foregroundL dark:text-foregroundD">
                        تعریف الگوی کاری جدید
                    </h1>
                    <p className="text-muted-foregroundL dark:text-muted-foregroundD mt-2 text-sm">
                        لطفاً نوع الگوی کاری مورد نظر خود را برای شروع انتخاب کنید.
                    </p>
                </div>

                {/* --- بخش انتخاب نوع الگو (Cards) --- */}
                <RadioGroup value={selectedType} onChange={setSelectedType}>
                    <RadioGroup.Label className="sr-only">انتخاب نوع الگو</RadioGroup.Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {PATTERN_OPTIONS.map((option) => (
                            <RadioGroup.Option
                                key={option.id}
                                value={option.id}
                                className={({ checked }) =>
                                    clsx(
                                        'relative flex cursor-pointer rounded-xl border-2 p-5 shadow-sm transition-all duration-200 focus:outline-none',
                                        // استایل‌های حالت انتخاب شده و نشده
                                        checked
                                            ? 'border-primaryL bg-primaryL/5 dark:border-primaryD dark:bg-primaryD/10 ring-1 ring-primaryL/20'
                                            : 'border-borderL dark:border-borderD bg-background hover:border-primaryL/50 dark:hover:border-primaryD/50 hover:shadow-md'
                                    )
                                }
                            >
                                {({ checked }) => (
                                    <>
                                        <div className="flex w-full items-start gap-4">
                                            {/* آیکون */}
                                            <div className={clsx(
                                                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors',
                                                checked
                                                    ? 'bg-primaryL text-white dark:bg-primaryD'
                                                    : 'bg-secondaryL dark:bg-gray-700 text-muted-foregroundL dark:text-muted-foregroundD'
                                            )}>
                                                {option.icon}
                                            </div>

                                            {/* متن‌ها */}
                                            <div className="flex-1 text-right space-y-1">
                                                <RadioGroup.Label as="p" className={clsx(
                                                    "font-bold text-lg",
                                                    checked ? "text-primaryL dark:text-primaryD" : "text-foregroundL dark:text-foregroundD"
                                                )}>
                                                    {option.name}
                                                </RadioGroup.Label>
                                                <RadioGroup.Description as="span" className="inline-block text-sm leading-6 text-muted-foregroundL dark:text-muted-foregroundD">
                                                    {option.description}
                                                </RadioGroup.Description>
                                            </div>
                                        </div>

                                        {/* نشانگر تیک (فقط وقتی انتخاب شده نمایش داده شود) */}
                                        <div className={clsx(
                                            "absolute top-4 left-4 transition-opacity duration-200",
                                            checked ? "opacity-100" : "opacity-0"
                                        )}>
                                            <CheckCircle2 className="h-6 w-6 text-primaryL dark:text-primaryD fill-current" />
                                        </div>
                                    </>
                                )}
                            </RadioGroup.Option>
                        ))}
                    </div>
                </RadioGroup>
            </div>

            {/* --- کانتینر فرم (با انیمیشن ساده) --- */}
            {/* کلید (key) باعث می‌شود وقتی نوع عوض شد، کامپوننت دوباره ماونت شود و انیمیشن اجرا شود */}
            <div
                key={selectedType}
                className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
            >
                {selectedType === 'WEEK_PATTERN' ? (
                    // فرض بر این است که این کامپوننت کارت و استایل خودش را دارد
                    <NewWeekPatternForm onSuccess={handleSuccess} onCancel={handleCancel} />
                ) : (
                    // فرض بر این است که این کامپوننت کارت و استایل خودش را دارد
                    <NewShiftScheduleForm onSuccess={handleSuccess} onCancel={handleCancel} />
                )}
            </div>

        </div>
    );
}

export default NewWorkPatternPage;