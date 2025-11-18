import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
} from "@tanstack/react-table";
// ✅ حل خطای TS2724: استفاده از هوک جدید useWorkGroups
import { useWorkGroups } from "@/features/work-group/hooks/hook";
import { columns } from "@/features/work-group/components/workGroupPage/WorkGroupListColumns";

import type { PaginatedResponse, WorkGroup } from "@/features/work-group/types";
import type { UseQueryResult } from "@tanstack/react-query";

// ایمپورت کامپوننت‌های UI شما
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { PlusCircle } from "lucide-react";

function WorkGroupPage() {

  const navigate = useNavigate()
  // --- مدیریت وضعیت صفحه‌بندی ---
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // صفحه اول (۰-مبنا)
    pageSize: 10, // ۱۰ آیتم در هر صفحه
  });

  // --- فچ کردن داده‌ها ---
  const {
    data: paginatedData,
    isLoading,
    isError,
    error,
  } = useWorkGroups(
    pagination.pageIndex + 1, // API شما صفحه را از 1 می‌خواهد
    pagination.pageSize
  ) as UseQueryResult<PaginatedResponse<WorkGroup>, unknown>;

  // --- راه‌اندازی Table Instance ---
  const table = useReactTable({
    data: paginatedData?.data ?? [], // داده‌های جدول
    columns, // ستون‌ها
    pageCount: paginatedData?.meta.last_page ?? -1, // تعداد کل صفحات برای Pagination UI
    state: {
      pagination,
    },
    onPaginationChange: setPagination, // آپدیت کردن state صفحه‌بندی
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true, // مهم: به جدول می‌گوییم صفحه‌بندی سمت سرور است
  });

  // --- مدیریت حالت خطا ---
  if (isError) {
    return (
      <div className="p-8 max-w-4xl mx-auto" dir="rtl">
        <Alert variant="destructive">
          <AlertTitle>خطا در بارگذاری داده‌ها</AlertTitle>
          <AlertDescription>
            خطا هنگام دریافت لیست گروه‌های کاری: {(error as any)?.message || "خطای ناشناخته"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* هدر صفحه: طراحی بهتر با حاشیه پایین */}
      <div className="flex justify-between items-center pb-4 border-b border-borderL dark:border-borderD">
        <h1 className="text-3xl font-extrabold text-foregroundL dark:text-foregroundD">مدیریت گروه‌های کاری</h1>
        <Button
          variant="primary"
          // مسیر جدید برای ایجاد گروه کاری
          onClick={() => navigate('/work-groups/new')}
          className="shadow-lg hover:shadow-xl transition-shadow"
        >
          <PlusCircle className="h-4 w-4 ml-2" />
          افزودن گروه کاری جدید
        </Button>
      </div>

      {/* جدول داده‌ها */}
      <div className="bg-backgroundL-500 dark:bg-backgroundD p-4 rounded-lg shadow-xl">
        <DataTable
          table={table}
          isLoading={isLoading}
          notFoundMessage="هیچ گروه کاری یافت نشد. می‌توانید با دکمه بالا، گروه جدید ایجاد کنید."
        />
        <div className="pt-4">
          <DataTablePagination table={table} />
        </div>
      </div>

    </div>
  );
}

export default WorkGroupPage;