import { Skeleton } from '@/components/ui/Skeleton';
import clsx from 'clsx';

/**
 * کامپوننت اسکلت لودینگ برای صفحه ویرایش برنامه شیفتی
 * این کامپوننت ساختار EditShiftScheduleForm را شبیه‌سازی می‌کند
 */
export const EditShiftScheduleFormSkeleton = () => {
    return (
        <div
            className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6"
            dir="rtl"
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* --- ستون سمت چپ (محتوای اصلی - اسلات‌ها) --- */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex justify-between items-center">
                        {/* اسکلت عنوان صفحه */}
                        <Skeleton className="h-9 w-3/4 rounded-md" />
                    </div>

                    {/* اسکلت کارت اسلات‌ها */}
                    <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-xl">
                        <div className="p-5 space-y-4">
                            {/* اسکلت عنوان کارت */}
                            <Skeleton className="h-7 w-1/3 rounded-md" />
                            {/* اسکلت توضیحات کارت */}
                            <Skeleton className="h-4 w-full rounded-md" />
                            <Skeleton className="h-4 w-5/6 rounded-md" />

                            {/* اسکلت جدول اسلات‌ها */}
                            <div className="w-full overflow-x-auto border border-borderL dark:border-borderD rounded-lg pb-32">
                                <div className="min-w-[750px]">
                                    {/* هدر جدول اسکلتی */}
                                    <div
                                        className="grid grid-cols-[80px_3fr_1.5fr_1.5fr_100px] font-medium text-sm text-center bg-gray-100 dark:bg-gray-800 border-b border-borderL dark:border-borderD text-muted-foregroundL dark:text-muted-foregroundD"
                                    >
                                        <div className="p-3"><Skeleton className="h-5 w-3/4 mx-auto" /></div>
                                        <div className="p-3"><Skeleton className="h-5 w-1/2" /></div>
                                        <div className="p-3"><Skeleton className="h-5 w-3/4 mx-auto" /></div>
                                        <div className="p-3"><Skeleton className="h-5 w-3/4 mx-auto" /></div>
                                        <div className="p-3"><Skeleton className="h-5 w-1/2 mx-auto" /></div>
                                    </div>

                                    {/* بدنه جدول اسکلتی */}
                                    <div className="divide-y divide-borderL dark:divide-borderD">
                                        {/* رندر کردن 8 ردیف اسکلتی */}
                                        {Array.from({ length: 8 }).map((_, index) => (
                                            <div
                                                key={`skeleton-row-${index}`}
                                                className={clsx(
                                                    'grid grid-cols-[80px_3fr_1.5fr_1.5fr_100px] items-center p-2',
                                                    index % 2 === 1 ? "bg-secondaryL/30 dark:bg-secondaryD/20" : ""
                                                )}
                                            >
                                                {/* اسکلت روز */}
                                                <div className="p-3 flex justify-center items-center">
                                                    <Skeleton className="h-5 w-1/2" />
                                                </div>
                                                {/* اسکلت SelectBox الگو */}
                                                <div className="p-2">
                                                    <Skeleton className="h-10 w-full rounded-lg" />
                                                </div>
                                                {/* اسکلت CustomTimeInput شروع */}
                                                <div className="p-2">
                                                    <Skeleton className="h-10 w-full rounded-lg" />
                                                </div>
                                                {/* اسکلت CustomTimeInput پایان */}
                                                <div className="p-2">
                                                    <Skeleton className="h-10 w-full rounded-lg" />
                                                </div>
                                                {/* اسکلت دکمه ویرایش */}
                                                <div className="p-2 flex justify-center">
                                                    <Skeleton className="h-10 w-10 rounded-md" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ستون سمت راست (فرم ویرایش اطلاعات عمومی) --- */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                    <div
                        className="space-y-6 p-5 bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-xl"
                    >
                        {/* اسکلت عنوان کارت */}
                        <div className="flex items-center gap-3 border-b border-borderL dark:border-borderD pb-3">
                            <Skeleton className="h-6 w-6 rounded-md" />
                            <Skeleton className="h-6 w-1/2 rounded-md" />
                        </div>

                        {/* اسکلت فیلد نام */}
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-1/4 rounded-md" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>

                        {/* اسکلت فیلد تاریخ */}
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-1/3 rounded-md" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>

                        {/* اسکلت فیلد طول چرخه */}
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-1/2 rounded-md" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>

                        {/* اسکلت دکمه‌ها */}
                        <div className="flex flex-col gap-2 pt-4 border-t border-borderL dark:border-borderD">
                            <Skeleton className="h-10 w-full rounded-md" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
export default EditShiftScheduleFormSkeleton