import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { RadioGroup } from '@headlessui/react';
import { NewWeekPatternForm } from "@/features/work-pattern/components/newWorkPattern/NewWeekPatternForm";
import { NewShiftScheduleForm } from "@/features/shift-schedule/components/NewShiftScheduleForm";
import clsx from 'clsx';
import { Calendar, Repeat2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type PatternType = 'WEEK_PATTERN' | 'SHIFT_SCHEDULE';

// کامنت: تعریف آپشن‌ها بیرون کامپوننت برای جلوگیری از بازسازی در هر رندر
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
        description: 'مناسب برای نگهبانی، پرستاری و شیفت‌های ۱۲-۲۴ یا ۲۴-۴۸ و...',
        icon: <Repeat2 className="h-6 w-6" />
    },
];

function NewWorkPatternPage() {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState<PatternType>('WEEK_PATTERN');

    const handleSuccess = () => navigate('/work-patterns');
    const handleCancel = () => navigate('/work-patterns');
    const handleBack = () => navigate(-1);

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-10" dir="rtl">

            {/* --- ۱. هدر و نویگیشن (تمیز و مینیمال) --- */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="h-10 w-10 rounded-full hover:bg-backgroundL-500 dark:hover:bg-white/10"
                        title="بازگشت"
                    >
                        <ArrowRight className="h-5 w-5 text-muted-foregroundL" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
                            تعریف الگوی کاری جدید
                        </h1>
                        <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                            نوع زمان‌بندی مورد نظر خود را برای شروع انتخاب کنید.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- ۲. بخش انتخاب نوع الگو (کارت‌های تعاملی) --- */}
            <RadioGroup value={selectedType} onChange={setSelectedType}>
                <RadioGroup.Label className="sr-only">انتخاب نوع الگو</RadioGroup.Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PATTERN_OPTIONS.map((option) => (
                        <RadioGroup.Option
                            key={option.id}
                            value={option.id}
                            className={({ checked }) =>
                                clsx(
                                    'relative flex cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 focus:outline-none group',
                                    // استایل‌های پویا بر اساس وضعیت انتخاب
                                    checked
                                        ? 'border-primaryL bg-primaryL/[0.03] dark:border-primaryD dark:bg-primaryD/[0.05] shadow-lg shadow-primaryL/5 ring-1 ring-primaryL/20 scale-[1.01]'
                                        : 'border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD hover:border-primaryL/30 hover:bg-secondaryL/20 dark:hover:bg-white/5 hover:shadow-md'
                                )
                            }
                        >
                            {({ checked }) => (
                                <>
                                    <div className="flex w-full items-start gap-4">
                                        {/* آیکون با پس‌زمینه رنگی */}
                                        <div className={clsx(
                                            'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300',
                                            checked
                                                ? 'bg-primaryL text-white shadow-md shadow-primaryL/30 dark:bg-primaryD dark:shadow-primaryD/20'
                                                : 'bg-secondaryL/50 dark:bg-secondaryD/50 text-muted-foregroundL dark:text-muted-foregroundD group-hover:bg-white dark:group-hover:bg-white/10'
                                        )}>
                                            {option.icon}
                                        </div>

                                        {/* متن‌ها */}
                                        <div className="flex-1 text-right pt-0.5">
                                            <RadioGroup.Label as="p" className={clsx(
                                                "font-bold text-lg mb-1 transition-colors",
                                                checked ? "text-primaryL dark:text-primaryD" : "text-foregroundL dark:text-foregroundD group-hover:text-foregroundL"
                                            )}>
                                                {option.name}
                                            </RadioGroup.Label>
                                            <RadioGroup.Description as="span" className="text-sm leading-relaxed text-muted-foregroundL dark:text-muted-foregroundD block opacity-90">
                                                {option.description}
                                            </RadioGroup.Description>
                                        </div>
                                    </div>

                                    {/* آیکون تیک گوشه بالا (فقط در حالت انتخاب) */}
                                    <div className={clsx(
                                        "absolute top-4 left-4 transition-all duration-300 transform",
                                        checked ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-2"
                                    )}>
                                        <CheckCircle2 className="h-6 w-6 text-primaryL dark:text-primaryD fill-primaryL/10 dark:fill-primaryD/10" />
                                    </div>
                                </>
                            )}
                        </RadioGroup.Option>
                    ))}
                </div>
            </RadioGroup>

            {/* --- ۴. کانتینر فرم (با انیمیشن Smooth) --- */}
            <div className="relative min-h-[400px]">
                {/* استفاده از key برای Force Remount و اجرای انیمیشن هنگام تغییر تب */}
                <div
                    key={selectedType}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-forwards"
                >
                    {selectedType === 'WEEK_PATTERN' ? (
                        <NewWeekPatternForm onSuccess={handleSuccess} onCancel={handleCancel} />
                    ) : (
                        <NewShiftScheduleForm onSuccess={handleSuccess} onCancel={handleCancel} />
                    )}
                </div>
            </div>

        </div>
    );
}

export default NewWorkPatternPage;