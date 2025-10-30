import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
} from "@tanstack/react-table";
import { useWorkGroups } from "@/features/work-group/hooks/hook";
import { columns } from "@/features/work-group/components/workGroupPage/WorkGroupListColumns";

// --- ۱. ایمپورت کردن تایپ‌ها برای Type Assertion ---
import type { PaginatedResponse, WorkGroup } from "@/features/work-group/types";
import type { UseQueryResult } from "@tanstack/react-query";

// ایمپورت کامپوننت‌های UI خودت
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { PlusCircle } from "lucide-react";

function WorkGroupPage() {

  const navigate = useNavigate()
  // --- مدیریت وضعیت صفحه‌بندی ---
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // صفحه اول
    pageSize: 10, // ۱۰ آیتم در هر صفحه
  });

  // --- ۲. فچ کردن داده‌ها ---
  const {
    data: paginatedData,
    isLoading,
    isError,
    error,
  } = useWorkGroups(
    pagination.pageIndex + 1, // API شما صفحه را از 1 می‌خواهد
    pagination.pageSize
    // --- ۳. اعمال Type Assertion ---
    // به TypeScript می‌گوییم که نوع data را درست حدس بزند
  ) as UseQueryResult<PaginatedResponse<WorkGroup>, unknown>;
  // --- پایان اصلاحیه ---

  // --- ۴. راه‌اندازی Table Instance ---
  const table = useReactTable({
    // حالا TypeScript می‌داند که paginatedData?.data امن است
    data: paginatedData?.data ?? [], // داده‌های جدول
    columns, // ستون‌هایی که ساختی
    pageCount: paginatedData?.meta.last_page ?? -1, // تعداد کل صفحات
    state: {
      pagination,
    },
    onPaginationChange: setPagination, // آپدیت کردن state صفحه‌بندی
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true, // مهم: به جدول می‌گوییم صفحه‌بندی سمت سرور است
  });

  // --- ۵. مدیریت حالت خطا ---
  if (isError) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>خطا در بارگذاری داده‌ها</AlertTitle>
          <AlertDescription>
            {(error as any)?.message || "خطای ناشناخته"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      {/* هدر صفحه */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-borderL">مدیریت گروه‌های کاری</h1>
        <Button
          variant="primary"
          // به جای console.log، به صفحه جدید می‌رویم
          // نکته: مسیر روت شما احتمالاً 'work-groups' (جمع) است
          onClick={() => navigate('/work-group/new')}
        >
          <PlusCircle className="h-4 w-4 ml-2" />
          افزودن گروه کاری جدید
        </Button>
      </div>

      {/* جدول داده‌ها */}
      <div className="space-y-4">
        <DataTable
          table={table}
          isLoading={isLoading}
          notFoundMessage="هیچ گروه کاری یافت نشد."
        />
        <DataTablePagination table={table} />
      </div>

    </div>
  );
}

export default WorkGroupPage;

