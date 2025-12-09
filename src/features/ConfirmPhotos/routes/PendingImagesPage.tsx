import { useState, useMemo, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type PaginationState,
    type ColumnDef,
} from "@tanstack/react-table";
import { FileCheck, RefreshCcw, Eye } from 'lucide-react';

// Hooks & Types
import { useImageRequests } from '../hooks/useImageRequests';
import { type ImageRequest } from '../types';
import { formatDateToPersian } from '@/features/User/utils/dateHelper';
import { getFullImageUrl } from '@/features/User/utils/imageHelper';

// Shared Components
import { DataTable } from '@/components/ui/DataTable/index';
import { DataTablePagination } from '@/components/ui/DataTable/DataTablePagination';
import { Button } from '@/components/ui/Button';

// Local Components
import { ImageApprovalModal } from '../components/ImageApprovalModal';

export default function PendingImagesPage() {
    // --- State ---
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [selectedRequest, setSelectedRequest] = useState<ImageRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Data Fetching ---
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching
    } = useImageRequests({
        page: pageIndex + 1,
        per_page: pageSize
    });

    useEffect(() => {
        console.log("🖼️ [Page Render] Status:", {
            isLoading,
            isRefetching,
            isError,
            hasData: !!data,
            dataCount: data?.data?.length,
            meta: data?.meta
        });

        if (isError) {
            console.error("🖼️ [Page Error Detail]:", error);
        }
    }, [data, isLoading, isRefetching, isError, error]);

    const requests = useMemo(() => data?.data ?? [], [data]);
    const pageCount = useMemo(() => data?.meta?.last_page ?? 0, [data]);

    // --- Columns Definition ---
    const columns = useMemo<ColumnDef<ImageRequest>[]>(() => [
        {
            accessorKey: "employee.full_name",
            header: "درخواست کننده",
            cell: ({ row }) => {
                const emp = row.original.employee;
                if (!emp) return <span className="text-destructiveL-foreground dark:text-destructiveD-foreground">اطلاعات ناقص</span>;

                const fullName = `${emp.first_name} ${emp.last_name}`;
                const imgUrl = getFullImageUrl(row.original.original_path);

                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-borderL dark:border-borderD overflow-hidden bg-secondaryL dark:bg-secondaryD">
                            <img
                                src={imgUrl}
                                alt={fullName}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-sm text-foregroundL dark:text-foregroundD">{fullName}</span>
                            <span className="text-xs text-muted-foregroundL dark:text-muted-foregroundD">{emp.organization?.name || "---"}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            header: "نوع درخواست",
            cell: () => <span className="text-xs font-medium px-2 py-1 bg-infoL-background text-infoL-foreground dark:bg-infoD-background dark:text-infoD-foreground rounded-md border border-infoL-foreground/10">تایید عکس پروفایل</span>
        },
        {
            accessorKey: "created_at",
            header: "زمان ثبت",
            cell: ({ row }) => (
                <span className="text-xs dir-ltr text-foregroundL dark:text-foregroundD">
                    {formatDateToPersian(row.original.created_at, 'with-time')}
                </span>
            )
        },
        {
            id: "actions",
            header: "عملیات",
            cell: ({ row }) => (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs hover:bg-primaryL hover:text-primary-foregroundL dark:hover:bg-primaryD dark:hover:text-primary-foregroundD border-primaryL/30 dark:border-primaryD/30 text-primaryL dark:text-primaryD"
                    onClick={() => {
                        setSelectedRequest(row.original);
                        setIsModalOpen(true);
                    }}
                >
                    <Eye className="w-3.5 h-3.5 ml-1.5" />
                    بررسی
                </Button>
            )
        }
    ], []);

    const table = useReactTable({
        data: requests,
        columns,
        pageCount,
        state: { pagination: { pageIndex, pageSize } },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
    });

    return (
        <div className="p-4 md:p-8 space-y-6" dir="rtl">
            <div className="flex justify-between items-center pb-4 border-b border-borderL dark:border-borderD">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-foregroundL dark:text-foregroundD">
                        <FileCheck className="h-7 w-7 text-primaryL dark:text-primaryD" />
                        کارتابل درخواست‌ها
                    </h1>
                    <p className="text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                        مدیریت تصاویر و درخواست‌های ارسال شده توسط پرسنل.
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isRefetching} className="text-muted-foregroundL hover:text-foregroundL dark:text-muted-foregroundD dark:hover:text-foregroundD">
                    <RefreshCcw className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* نمایش ارور واضح در UI */}
            {isError && (
                <div className="bg-destructiveL-background border border-destructiveL-foreground/20 text-destructiveL-foreground px-4 py-3 rounded-xl relative mb-4" role="alert">
                    <strong className="font-bold ml-2">خطا در دریافت اطلاعات!</strong>
                    <span className="block sm:inline">{(error as any)?.message || "ارتباط با سرور برقرار نشد."}</span>
                </div>
            )}

            <div className="bg-backgroundL-500 dark:bg-backgroundD rounded-xl border border-borderL dark:border-borderD shadow-sm overflow-hidden">
                <DataTable
                    table={table}
                    isLoading={isLoading}
                    notFoundMessage="هیچ درخواست جدیدی وجود ندارد."
                />
                <div className="p-4 border-t border-borderL dark:border-borderD">
                    <DataTablePagination table={table} />
                </div>
            </div>

            <ImageApprovalModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedRequest(null);
                }}
                request={selectedRequest}
            />
        </div>
    );
}