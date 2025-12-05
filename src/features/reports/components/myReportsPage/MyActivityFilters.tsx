import { useState, Fragment } from "react";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";
import PersianDatePickerInput from "@/lib/PersianDatePickerInput";
import { type DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import { Dialog, Transition } from "@headlessui/react";

// ایمپورت تایپ فیلترهای API
import type { MyLogFilters } from "@/features/reports/api/api";

// گزینه‌های فیلتر نوع (بدون تغییر)
const typeOptions: SelectOption[] = [
    { id: "all", name: "همه انواع" },
    { id: "check_in", name: "فقط ورود" },
    { id: "check_out", name: "فقط خروج" },
];

// تعریف پراپ‌ها (بدون تغییر)
interface MyActivityFiltersProps {
    onFilterChange: (
        filters: Pick<MyLogFilters, "start_date" | "end_date" | "type">
    ) => void;
}

// تابع کمکی فرمت تاریخ (بدون تغییر)
const formatApiDate = (date: DateObject | null): string | undefined => {
    if (!date) return undefined;
    const gregorianDate = date.convert(gregorian);
    return `${gregorianDate.year}-${String(gregorianDate.month.number).padStart(
        2,
        "0"
    )}-${String(gregorianDate.day).padStart(2, "0")}`;
};

export function MyActivityFilters({ onFilterChange }: MyActivityFiltersProps) {
    // [جدید] استیت برای باز و بسته شدن مودال در موبایل
    const [isOpen, setIsOpen] = useState(false);

    // استیت‌های داخلی فیلتر (بدون تغییر)
    const [startDate, setStartDate] = useState<DateObject | null>(null);
    const [endDate, setEndDate] = useState<DateObject | null>(null);
    const [type, setType] = useState<SelectOption | null>(typeOptions[0]);

    const handleApplyFilters = () => {
        onFilterChange({
            start_date: formatApiDate(startDate),
            end_date: formatApiDate(endDate),
            type:
                type?.id === "all"
                    ? undefined
                    : (type?.id as "check_in" | "check_out"),
        });
        // [جدید] بعد از اعمال فیلتر، مودال موبایل را ببند
        setIsOpen(false);
    };

    // [جدید] محتوای فیلترها در یک متغیر جداگانه قرار می‌گیرد
    // فیلترهای دستی و با تاخیر طبق درخواست قبلی شما حذف شده‌اند
    const filterContent = (
        <div
            className="p-5 rounded-2xl border
                 bg-backgroundL-500 dark:bg-backgroundD
                 border-borderL dark:border-borderD
                 shadow-sm transition-colors duration-300 space-y-6"
        >
            <div className="flex items-center justify-between">
                {/* هدر بخش فیلتر */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="p-1.5 bg-primaryL/10 dark:bg-primaryD/10 rounded-lg">
                        <Filter className="w-4 h-4 text-primaryL dark:text-primaryD" />
                    </div>
                    <h3 className="font-bold text-sm text-foregroundL dark:text-foregroundD">
                        فیلتر درخواست ها
                    </h3>
                </div>
                {/* دکمه بستن (فقط در مودال موبایل نمایش داده می‌شود) */}
                <button className="md:hidden" onClick={() => setIsOpen(false)}>
                    <X className="w-5 h-5 text-muted-foregroundL dark:text-muted-foregroundD" />
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {/* فیلتر تاریخ */}
                <PersianDatePickerInput
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="از تاریخ..."
                    label="تاریخ شروع"
                />
                <PersianDatePickerInput
                    value={endDate}
                    onChange={setEndDate}
                    placeholder="تا تاریخ..."
                    label="تاریخ پایان"
                />

                {/* فیلتر نوع */}
                <SelectBox
                    label="نوع رویداد"
                    placeholder="انتخاب کنید"
                    options={typeOptions}
                    value={type}
                    onChange={setType}
                />
            </div>

            <button
                type="button"
                onClick={handleApplyFilters}
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5
                   rounded-xl font-medium shadow-md
                   bg-primaryL text-primary-foregroundL
                   dark:bg-primaryD dark:text-primary-foregroundD
                   hover:bg-primaryL/90 dark:hover:bg-primaryD/90
                   focus:outline-none focus:ring-2 focus:ring-offset-2
                   focus:ring-primaryL dark:focus:ring-primaryD
                   transition-all duration-200"
            >
                <Filter className="w-5 h-5" />
                <span>اعمال فیلتر</span>
            </button>
        </div>
    );

    // [جدید] ساختار ریسپانسیو مشابه صفحه درخواست‌ها
    return (
        <>
            {/* --- دکمه موبایل --- */}
            <div className="md:hidden flex justify-end mb-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-borderL dark:border-borderD text-foregroundL dark:text-foregroundD hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    نمایش فیلترها
                </button>
            </div>

            {/* --- سایدبار دسکتاپ --- */}
            {/* این بخش `w-full` می‌گیرد چون والدش (در MyReportsPage) ابعاد را کنترل می‌کند */}
            <aside className="hidden md:block w-full">{filterContent}</aside>

            {/* --- مودال (Dialog) موبایل --- */}
            <Transition show={isOpen} as={Fragment}>
                <Dialog
                    onClose={() => setIsOpen(false)}
                    className="relative z-50 md:hidden"
                >
                    {/* Backdrop */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
                    </Transition.Child>

                    {/* Panel */}
                    <Transition.Child
                        as={Fragment}
                        enter="transform transition ease-out duration-300"
                        enterFrom="translate-x-full opacity-0" // از راست وارد می‌شود
                        enterTo="translate-x-0 opacity-100"
                        leave="transform transition ease-in duration-200"
                        leaveFrom="translate-x-0 opacity-100"
                        leaveTo="translate-x-full opacity-0" // به راست خارج می‌شود
                    >
                        <Dialog.Panel className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-backgroundL-500 dark:bg-backgroundD shadow-xl overflow-y-auto rounded-l-2xl p-4">
                            {filterContent}
                        </Dialog.Panel>
                    </Transition.Child>
                </Dialog>
            </Transition>
        </>
    );
}