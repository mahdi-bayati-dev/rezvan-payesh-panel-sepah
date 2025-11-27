import { useState } from "react";
import { useGeneratedShiftsList } from "../hooks/useGeneratedShiftsList";
import { DataTable } from "@/components/ui/DataTable/index";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import {
    useReactTable,
    getCoreRowModel,
    type ColumnDef,
} from "@tanstack/react-table";
import { type ShiftResource } from "../types";
import { Loader2, RefreshCw, CalendarCheck, User, Clock, CalendarDays } from "lucide-react";
import PersianDatePickerInput from "@/lib/PersianDatePickerInput";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { Button } from "@/components/ui/Button";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// --- تابع تبدیل اعداد به فارسی ---
const toPersianDigits = (n: number | string | null | undefined): string => {
    if (n === null || n === undefined) return "";
    return n.toString().replace(/\d/g, (x) => ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][parseInt(x)]);
};

interface GeneratedShiftsListProps {
    shiftScheduleId: number | string;
}

export const GeneratedShiftsList = ({ shiftScheduleId }: GeneratedShiftsListProps) => {
    const [filters, setFilters] = useState<{ start_date?: string; end_date?: string }>({});
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const { data, isLoading, isRefetching, refetch } = useGeneratedShiftsList(shiftScheduleId, {
        ...filters,
        per_page: pagination.pageSize,
        page: pagination.pageIndex + 1
    });

    const columns: ColumnDef<ShiftResource>[] = [
        {
            header: "تاریخ شیفت",
            accessorKey: "date",
            cell: ({ getValue }) => {
                const dateStr = getValue() as string;
                if (!dateStr) return <span className="text-muted-foregroundL">-</span>;

                const dateObj = new DateObject({ date: dateStr, calendar: gregorian, locale: gregorian_en });
                dateObj.convert(persian, persian_fa);
                const jalaliDate = dateObj.format("YYYY/MM/DD");

                return <span className="font-medium text-foregroundL dark:text-foregroundD">{toPersianDigits(jalaliDate)}</span>;
            }
        },
        {
            header: "نام کارمند",
            accessorFn: (row) => `${row.employee.first_name} ${row.employee.last_name}`,
            cell: ({ getValue }) => <div className="flex items-center gap-2 font-medium"><User className="w-4 h-4 text-primaryL opacity-60" />{getValue() as string}</div>
        },
        {
            header: "کد پرسنلی",
            accessorKey: "employee.personnel_code",
            cell: ({ getValue }) => <span className="text-xs text-muted-foregroundL  bg-secondaryL/30 px-1.5 py-0.5 rounded">{toPersianDigits(getValue() as string)}</span>
        },
        {
            header: "وضعیت / زمان",
            cell: ({ row }) => {
                if (row.original.is_off_day) {
                    return (
                        <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 px-2.5 py-1 rounded-md w-max">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">تعطیل / استراحت</span>
                        </div>
                    );
                }
                const start = row.original.work_pattern?.start_time?.slice(0, 5) || "---";
                const end = row.original.work_pattern?.end_time?.slice(0, 5) || "---";

                return (
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-xs text-primaryL dark:text-primaryD">{row.original.work_pattern?.name || 'شیفت عادی'}</span>
                        <div className="flex items-center gap-2 text-muted-foregroundL text-xs dir-ltr">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">
                                {toPersianDigits(start)} <span className="text-gray-300 mx-1">|</span> {toPersianDigits(end)}
                            </span>
                        </div>
                    </div>
                );
            }
        },
    ];

    const table = useReactTable({
        data: data?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: data?.meta?.last_page || 1,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    const startDateObject = filters.start_date ? new DateObject({ date: filters.start_date, calendar: gregorian }) : null;

    return (
        <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-sm mt-8 overflow-hidden">

            {/* هدر لیست */}
            <div className="p-5 border-b border-borderL dark:border-borderD flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-secondaryL/20 to-transparent dark:from-secondaryD/10">
                <div>
                    <h3 className="text-lg font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        لیست شیفت‌های تولید شده
                    </h3>
                    <p className="text-xs text-muted-foregroundL mt-1">
                        نمایش خروجی نهایی تخصیص‌ها برای کارمندان
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading || isRefetching}
                    className="gap-2 text-muted-foregroundL hover:text-primaryL hover:bg-primaryL/10"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                    بروزرسانی
                </Button>
            </div>

            <div className="p-5 space-y-4">
                {/* فیلتر تاریخ */}
                <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50/80 dark:bg-gray-800/30 rounded-lg border border-borderL/50 dark:border-borderD/50">
                    <div className="w-full md:w-1/3">
                        <PersianDatePickerInput
                            value={startDateObject}
                            label="فیلتر از تاریخ"
                            placeholder="انتخاب تاریخ..."
                            onChange={(d) => {
                                const val = d ? d.convert(gregorian, gregorian_en).format('YYYY-MM-DD') : undefined;
                                setFilters(prev => ({ ...prev, start_date: val }));
                            }}
                        />
                    </div>
                </div>

                {/* جدول */}
                <div className="relative min-h-[200px] rounded-lg border border-borderL dark:border-borderD overflow-hidden">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 z-10 backdrop-blur-[2px]">
                            <Loader2 className="w-8 h-8 animate-spin text-primaryL" />
                            <span className="text-sm mt-3 font-bold text-primaryL">در حال دریافت لیست...</span>
                        </div>
                    ) : null}

                    <DataTable table={table} notFoundMessage="هنوز شیفتی برای این بازه تولید نشده است." />
                    <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-borderL dark:border-borderD p-2">
                        <DataTablePagination table={table} />
                    </div>
                </div>
            </div>
        </div>
    );
};