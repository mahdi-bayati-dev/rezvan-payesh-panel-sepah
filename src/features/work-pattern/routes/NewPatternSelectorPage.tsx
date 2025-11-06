import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
// import { Button } from '@/components/ui/Button';
import { RadioGroup } from '@headlessui/react';
import { NewWeekPatternForm } from "@/features/work-pattern/components/newWorkPattern/NewWeekPatternForm"; // ✅ فرم الگوی ثابت
import { NewShiftScheduleForm } from "@/features/shift-schedule/components/NewShiftScheduleForm"; // ✅ فرم برنامه شیفتی
import clsx from 'clsx';
import { Calendar, Repeat2 } from 'lucide-react'; // آیکون‌ها

type PatternType = 'WEEK_PATTERN' | 'SHIFT_SCHEDULE';

function NewWorkPatternPage() {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState<PatternType>('WEEK_PATTERN');

    const handleSuccess = () => {
        // کامنت: پس از ایجاد موفقیت‌آمیز هر نوع الگو، به صفحه اصلی لیست برمی‌گردیم
        navigate('/work-patterns');
    };

    const handleCancel = () => {
        navigate('/work-patterns');
    };

    const options: { id: PatternType; name: string; description: string; icon: React.ReactNode }[] = [
        {
            id: 'WEEK_PATTERN',
            name: 'الگوی کاری ثابت (هفتگی)',
            description: 'برنامه ثابت هفتگی (شنبه تا جمعه) با ساعات مشخص.',
            icon: <Calendar className="h-6 w-6" />
        },
        {
            id: 'SHIFT_SCHEDULE',
            name: 'برنامه شیفتی چرخشی',
            description: 'برنامه چرخشی (مانند ۴ روز کار، ۲ روز استراحت) با طول چرخه دلخواه.',
            icon: <Repeat2 className="h-6 w-6" />
        },
    ];


    return (
        <div className=" mx-auto p-4 md:p-8 space-y-8 bg-backgroundL-500 rounded-2xl shadow-xl dark:bg-backgroundD" dir="rtl">

            <h1 className="text-2xl font-bold border-b border-borderL dark:border-borderD pb-4">
                انتخاب نوع الگوی جدید
            </h1>

            {/* بخش انتخاب نوع الگو (Radio Group) */}
            <RadioGroup value={selectedType} onChange={setSelectedType} className="space-y-4">
                <RadioGroup.Label className="sr-only">انتخاب نوع الگو</RadioGroup.Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map((option) => (
                        <RadioGroup.Option
                            key={option.id}
                            value={option.id}
                            className={({ checked }) =>
                                clsx(
                                    'cursor-pointer rounded-xl border-2 p-4 flex focus:outline-none transition-colors',
                                    checked
                                        ? 'bg-primaryL/10 border-primaryL dark:bg-primaryD/10 dark:border-primaryD ring-2 ring-primaryL dark:ring-primaryD'
                                        : 'bg-white dark:bg-gray-800 border-borderL dark:border-borderD hover:bg-secondaryL dark:hover:bg-gray-700'
                                )
                            }
                        >
                            {({ checked }) => (
                                <div className="flex items-center w-full">
                                    <span className={clsx(
                                        'p-2 rounded-full mr-3',
                                        checked ? 'bg-primaryL text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                    )}>
                                        {option.icon}
                                    </span>
                                    <div className="text-right flex-1">
                                        <RadioGroup.Label as="p" className="font-semibold text-lg">
                                            {option.name}
                                        </RadioGroup.Label>
                                        <RadioGroup.Description as="span" className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                                            {option.description}
                                        </RadioGroup.Description>
                                    </div>
                                    <div className={clsx(
                                        'w-4 h-4 rounded-full border-2 ml-4',
                                        checked ? 'border-primaryL bg-primaryL' : 'border-gray-300 dark:border-gray-500'
                                    )}></div>
                                </div>
                            )}
                        </RadioGroup.Option>
                    ))}
                </div>
            </RadioGroup>

            {/* رندر فرم انتخابی */}
            <div className="mt-8 pt-6 border-t border-borderL dark:border-borderD">
                {selectedType === 'WEEK_PATTERN' && (
                    <NewWeekPatternForm onSuccess={handleSuccess} onCancel={handleCancel} />
                )}
                {selectedType === 'SHIFT_SCHEDULE' && (
                    <NewShiftScheduleForm onSuccess={handleSuccess} onCancel={handleCancel} />
                )}
            </div>

        </div>
    );
}

export default NewWorkPatternPage;
