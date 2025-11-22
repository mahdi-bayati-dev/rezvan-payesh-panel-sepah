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
import { Loader2,  RefreshCw, CalendarCheck } from "lucide-react";
import PersianDatePickerInput from "@/lib/PersianDatePickerInput"; 
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { Button } from "@/components/ui/Button";
// ✅ ۱. ایمپورت‌های تقویم شمسی
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface GeneratedShiftsListProps {
    shiftScheduleId: number | string;
}

export const GeneratedShiftsList = ({ shiftScheduleId }: GeneratedShiftsListProps) => {
    const [filters, setFilters] = useState<{ start_date?: string; end_date?: string }>({});
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // استفاده از هوک
    const { data, isLoading, isRefetching, refetch } = useGeneratedShiftsList(shiftScheduleId, {
        ...filters,
        per_page: pagination.pageSize,
        // اگر API شما pageIndex را از 1 شروع می‌کند، اینجا +1 کنید
        // page: pagination.pageIndex + 1 
    });

    // تعریف ستون‌ها
    const columns: ColumnDef<ShiftResource>[] = [
        {
            header: "تاریخ",
            accessorKey: "date",
            // ✅ ۲. تبدیل تاریخ میلادی به شمسی در سلول جدول
            cell: ({ getValue }) => {
                const dateStr = getValue() as string;
                if (!dateStr) return <span className="text-muted-foregroundL">-</span>;

                // تبدیل به شمسی
                const dateObj = new DateObject({ date: dateStr, calendar: gregorian, locale: gregorian_en });
                dateObj.convert(persian, persian_fa);
                const jalaliDate = dateObj.format("YYYY/MM/DD"); // فرمت دلخواه

                return <span className=" dir-ltr text-xs font-medium">{jalaliDate}</span>;
            }
        },
        {
            header: "نام کارمند",
            accessorFn: (row) => `${row.employee.first_name} ${row.employee.last_name}`,
        },
        {
            header: "کد پرسنلی",
            accessorKey: "employee.personnel_code",
            cell: ({ getValue }) => <span className="text-xs text-muted-foregroundL">{getValue() as string}</span>
        },
        {
            header: "شیفت / وضعیت",
            cell: ({ row }) => {
                if (row.original.is_off_day) {
                    return <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded text-[11px] font-medium">تعطیل / آف</span>;
                }
                return (
                    <div className="flex flex-col text-xs">
                        <span className="font-semibold text-primaryL dark:text-primaryD">{row.original.work_pattern?.name || 'شیفت عادی'}</span>
                        <span className="text-muted-foregroundL dir-ltr text-[10px]">
                            {row.original.work_pattern?.start_time?.slice(0, 5)} - {row.original.work_pattern?.end_time?.slice(0, 5)}
                        </span>
                    </div>
                );
            }
        },
    ];

    // تنظیم جدول
    const table = useReactTable({
        data: data?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: data?.meta?.last_page || 1,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    // حل مشکل value={ }: تبدیل رشته تاریخ به آبجکت DateObject برای کامپوننت پیکر
    const startDateObject = filters.start_date ? new DateObject({ date: filters.start_date, calendar: gregorian }) : null;

    return (
        <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-xl mt-6 overflow-hidden">
            
            {/* هدر لیست */}
            <div className="p-5 border-b border-borderL dark:border-borderD flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondaryL/10">
                <div>
                    <h3 className="text-lg font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-primaryL dark:text-primaryD" />
                        لیست شیفت‌های تولید شده
                    </h3>
                    <p className="text-xs text-muted-foregroundL mt-1">
                        نمایش خروجی نهایی تخصیص‌ها برای کارمندان (تقویم شمسی)
                    </p>
                </div>
                
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()} 
                    disabled={isLoading || isRefetching}
                    className="gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                    بروزرسانی لیست
                </Button>
            </div>

            <div className="p-5 space-y-4">
                {/* فیلتر تاریخ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-borderL/50 dark:border-borderD/50">
                    <PersianDatePickerInput
                        value={startDateObject} 
                        label="فیلتر از تاریخ"
                        placeholder="انتخاب کنید..."
                        onChange={(d) => {
                            const val = d ? d.convert(gregorian, gregorian_en).format('YYYY-MM-DD') : undefined;
                            setFilters(prev => ({ ...prev, start_date: val }));
                        }}
                    />
                </div>

                {/* جدول */}
                <div className="relative min-h-[200px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 z-10 backdrop-blur-[1px]">
                            <Loader2 className="w-8 h-8 animate-spin text-primaryL" />
                            <span className="text-xs mt-2 font-medium">در حال دریافت اطلاعات...</span>
                        </div>
                    ) : null}
                    
                    <DataTable table={table} notFoundMessage="هنوز شیفتی برای این بازه تولید نشده است." />
                    <DataTablePagination table={table} />
                </div>
            </div>
        </div>
    );
};