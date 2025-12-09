import { useState } from "react";
import { useGeneratedShiftsList } from "../hooks/useGeneratedShiftsList";
import { DataTable } from "@/components/ui/DataTable/index";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { useReactTable, getCoreRowModel, type ColumnDef } from "@tanstack/react-table";
import { type ShiftResource } from "../types";
import { Loader2, RefreshCw, CalendarRange, UserCircle2, ArrowLeftRight, CalendarOff } from "lucide-react";
import PersianDatePickerInput from "@/lib/PersianDatePickerInput";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { Button } from "@/components/ui/Button";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import clsx from "clsx";

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
            header: "تاریخ",
            accessorKey: "date",
            cell: ({ getValue }) => {
                const dateStr = getValue() as string;
                if (!dateStr) return "-";
                const dateObj = new DateObject({ date: dateStr, calendar: gregorian, locale: gregorian_en });
                dateObj.convert(persian, persian_fa);
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-foregroundL dark:text-foregroundD">{toPersianDigits(dateObj.format("YYYY/MM/DD"))}</span>
                        <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD/70">{dateObj.format("dddd")}</span>
                    </div>
                );
            }
        },
        {
            header: "پرسنل",
            accessorFn: (row) => `${row.employee.first_name} ${row.employee.last_name}`,
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondaryL/50 dark:bg-secondaryD/50 flex items-center justify-center text-muted-foregroundL dark:text-muted-foregroundD">
                        <UserCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm text-foregroundL dark:text-foregroundD">{row.original.employee.first_name} {row.original.employee.last_name}</span>
                        <span className="text-[10px] text-muted-foregroundL dark:text-muted-foregroundD/70">{toPersianDigits(row.original.employee.personnel_code)}</span>
                    </div>
                </div>
            )
        },
        {
            header: "وضعیت / زمان‌بندی",
            cell: ({ row }) => {
                if (row.original.is_off_day) {
                    return (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-warningL-background text-warningL-foreground dark:bg-warningD-background dark:text-warningD-foreground border border-warningL-foreground/20">
                            <CalendarOff className="w-3.5 h-3.5" />
                            تعطیل / استراحت
                        </div>
                    );
                }
                const start = row.original.work_pattern?.start_time?.slice(0, 5) || "--:--";
                const end = row.original.work_pattern?.end_time?.slice(0, 5) || "--:--";
                const shiftName = toPersianDigits(row.original.work_pattern?.name || 'شیفت عادی');

                return (
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center min-w-[3rem]">
                            <span className="text-xs font-bold text-foregroundL dark:text-foregroundD dir-ltr">{toPersianDigits(start)}</span>
                            <span className="text-[10px] text-muted-foregroundL dark:text-muted-foregroundD/60">شروع</span>
                        </div>
                        <ArrowLeftRight className="w-3 h-3 text-muted-foregroundL/50 dark:text-muted-foregroundD/30" />
                        <div className="flex flex-col items-center min-w-[3rem]">
                            <span className="text-xs font-bold text-foregroundL dark:text-foregroundD dir-ltr">{toPersianDigits(end)}</span>
                            <span className="text-[10px] text-muted-foregroundL dark:text-muted-foregroundD/60">پایان</span>
                        </div>
                        <div className="h-6 w-px bg-borderL dark:bg-borderD mx-1 opacity-50"></div>
                        <span className="text-xs text-primaryL dark:text-primaryD font-medium truncate max-w-[200px]" title={shiftName}>
                            {shiftName}
                        </span>
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

    return (
        <div className="space-y-4 mt-8">
            <h3 className="text-lg font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2 px-1">
                <CalendarRange className="w-5 h-5 text-primaryL dark:text-primaryD" />
                تقویم کاری تولید شده
            </h3>

            <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-2xl shadow-sm overflow-hidden">
                {/* نوار ابزار و فیلتر */}
                <div className="p-4 border-b border-borderL dark:border-borderD flex flex-col md:flex-row gap-4 justify-between items-center bg-secondaryL/5 dark:bg-secondaryD/5">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64 group">
                            <div className="[&_input]:pr-9 [&_input]:bg-backgroundL-500 [&_input]:dark:bg-backgroundD [&_input]:border-borderL [&_input]:dark:border-borderD">
                                <PersianDatePickerInput
                                    label=""
                                    value={filters.start_date ? new DateObject({ date: filters.start_date, calendar: gregorian }) : null}
                                    placeholder="فیلتر از تاریخ..."
                                    onChange={(d) => setFilters(prev => ({ ...prev, start_date: d?.convert(gregorian, gregorian_en).format('YYYY-MM-DD') }))}
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isLoading || isRefetching}
                        className="gap-2 text-muted-foregroundL dark:text-muted-foregroundD hover:text-primaryL dark:hover:text-primaryD hover:bg-primaryL/10 dark:hover:bg-primaryD/10"
                    >
                        <RefreshCw className={clsx("w-4 h-4", isRefetching && 'animate-spin')} />
                        بروزرسانی لیست
                    </Button>
                </div>

                {/* جدول داده‌ها */}
                <div className="relative min-h-[300px]">
                    {isLoading && (
                        <div className="absolute inset-0 bg-backgroundL-500/80 dark:bg-backgroundD/80 z-20 flex flex-col items-center justify-center backdrop-blur-[2px]">
                            <Loader2 className="w-10 h-10 animate-spin text-primaryL dark:text-primaryD" />
                            <span className="mt-3 text-sm font-medium text-primaryL dark:text-primaryD">در حال دریافت اطلاعات...</span>
                        </div>
                    )}

                    <div className="border-b border-borderL dark:border-borderD">
                        <DataTable table={table} notFoundMessage="هنوز شیفتی برای این بازه تولید نشده است." />
                    </div>

                    <div className="p-2 bg-secondaryL/10 dark:bg-secondaryD/10">
                        <DataTablePagination table={table} />
                    </div>
                </div>
            </div>
        </div>
    );
};