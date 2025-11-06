import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type PaginationState,
} from "@tanstack/react-table";

// --- هوک‌ها و تایپ‌ها ---
import { useUsers } from '@/features/User/hooks/hook';
import { columns as userColumns } from '@/features/User/components/userList/UserTableColumns'; // ستون‌های استاندارد کاربر
import { useWeekPatternDetails } from '@/features/work-pattern/hooks/useWeekPatternDetails';

// --- کامپوننت‌های UI ---
import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Search, ArrowRight, Loader2, Info } from 'lucide-react';

// (هوک Debounce)
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


/**
 * صفحه مشاهده کارمندان تخصیص داده شده به یک الگوی کاری
 * در مسیر: /work-patterns/employees/:patternId
 */
export default function WorkPatternEmployeesPage() {
    const navigate = useNavigate();
    const { patternId } = useParams<{ patternId: string }>();
    const numericPatternId = Number(patternId);

    // --- ۱. فچ کردن جزئیات الگو (فقط برای نمایش نام) ---
    const {
        data: patternDetails,
        isLoading: isLoadingPattern,
        isError: isErrorPattern
    } = useWeekPatternDetails(numericPatternId);

    // --- ۲. مدیریت State صفحه‌بندی و جستجو ---
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // --- ۳. فچ کردن داده‌های کاربران (با فیلتر الگوی کاری) ---
    const {
        data: userResponse,
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        error: usersError
    } = useUsers({
        // ✅ پارامتر کلیدی: work_pattern_id
        work_pattern_id: isNaN(numericPatternId) ? 0 : numericPatternId,
        page: pageIndex + 1,
        per_page: pageSize,
        search: debouncedSearch,
    });

    const users = useMemo(() => userResponse?.data ?? [], [userResponse]);
    const pageCount = useMemo(() => userResponse?.meta?.last_page ?? 0, [userResponse]);


    // --- ۴. راه‌اندازی TanStack Table ---
    const table = useReactTable({
        data: users,
        columns: userColumns, // استفاده از ستون‌های استاندارد
        pageCount: pageCount,
        state: {
            pagination: { pageIndex, pageSize },
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        manualFiltering: true,
    });

    // --- ۵. مدیریت خطا و لودینگ اولیه ---
    if (isNaN(numericPatternId) || isErrorPattern) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>
                        {isErrorPattern ? "خطا در بارگذاری جزئیات الگوی کاری." : "شناسه الگوی کاری (ID) نامعتبر است."}
                    </AlertDescription>
                    <Button variant="link" className="mt-4" onClick={() => navigate(-1)}>
                        بازگشت
                    </Button>
                </Alert>
            </div>
        );
    }

    if (isLoadingPattern) {
        return (
            <div className="flex justify-center items-center h-screen" dir="rtl">
                <Loader2 className="h-12 w-12 animate-spin text-primaryL" />
                <span className="mr-3">در حال بارگذاری جزئیات الگو...</span>
            </div>
        );
    }

    const patternName = patternDetails?.name || 'الگوی کاری نامشخص';


    return (
        <div className="p-4 md:p-8 space-y-6" dir="rtl">
            {/* هدر صفحه */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold dark:text-borderL">
                        کارمندان زیرمجموعه: <span className='text-primaryL dark:text-primaryD'>{patternName}</span>
                    </h1>
                    <p className="text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                        لیست کارمندانی که الگوی کاری **{patternName}** به آن‌ها تخصیص داده شده است.
                    </p>
                </div>
            </div>

            {/* نوار ابزار: جستجو و بازگشت */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD">
                <div className='flex items-center gap-2'>
                    <Button
                        variant="outline"
                        size="md"
                        onClick={() => navigate('/work-patterns')}
                    >
                        <ArrowRight className="h-4 w-4 ml-2" />
                        بازگشت به الگوها
                    </Button>
                    <div className="relative w-full max-w-sm">
                        <Input
                            label=''
                            placeholder="جستجو در نام، ایمیل، کد پرسنلی..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10"
                        />
                        <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL" />
                    </div>
                </div>
                {/* دکمه دیگری در اینجا نیاز نیست */}
            </div>

            {/* کامپوننت جدول شما */}
            {isErrorUsers ? (
                <Alert variant="destructive">
                    <AlertTitle>خطا در بارگذاری کارمندان</AlertTitle>
                    <AlertDescription>{(usersError as Error)?.message || "خطای ناشناخته در دریافت لیست کارمندان."}</AlertDescription>
                </Alert>
            ) : (
                <DataTable
                    table={table}
                    isLoading={isLoadingUsers}
                    notFoundMessage="کارمندی با این الگوی کاری یافت نشد."
                />
            )}

            {/* کامپوننت صفحه‌بندی شما */}
            {pageCount > 0 && (
                <DataTablePagination table={table} />
            )}
        </div>
    );
}
