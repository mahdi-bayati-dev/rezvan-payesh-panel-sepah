import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
} from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";

// هوک‌ها و تایپ‌ها
import { useWorkGroups } from "@/features/work-group/hooks/hook";
import { columns } from "@/features/work-group/components/workGroupPage/WorkGroupListColumns";
import type { PaginatedResponse, WorkGroup } from "@/features/work-group/types";
import type { UseQueryResult } from "@tanstack/react-query";

// ✅ کامپوننت‌های UI اختصاصی خودت
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTable/DataTablePagination";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Modal, ModalHeader, ModalBody } from "@/components/ui/Modal"; // استفاده از مودال خودت

// کامپوننت فرم
import { WorkGroupForm } from "@/features/work-group/components/newWorkGroup/WorkGroupForm";

function WorkGroupPage() {
  // مدیریت وضعیت باز/بسته بودن مودال
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // مدیریت وضعیت صفحه‌بندی
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // فچ کردن داده‌ها
  const {
    data: paginatedData,
    isLoading,
    isError,
    error,
  } = useWorkGroups(
    pagination.pageIndex + 1,
    pagination.pageSize
  ) as UseQueryResult<PaginatedResponse<WorkGroup>, unknown>;

  // تنظیمات جدول
  const table = useReactTable({
    data: paginatedData?.data ?? [],
    columns,
    pageCount: paginatedData?.meta.last_page ?? -1,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    // داده‌ها به صورت خودکار توسط React Query رفرش می‌شوند
  };

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

      {/* هدر صفحه */}
      <div className="flex justify-between items-center pb-4 border-b border-borderL dark:border-borderD">
        <div>
          <h1 className="text-3xl font-extrabold text-foregroundL dark:text-foregroundD">مدیریت گروه‌های کاری</h1>
          <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD mt-1">
            لیست گروه‌های کاری و مدیریت اعضا و الگوهای شیفتی
          </p>
        </div>

        {/* دکمه افزودن که مودال را باز می‌کند */}
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <PlusCircle className="h-4 w-4 ml-2" />
          افزودن گروه کاری جدید
        </Button>
      </div>

      {/* جدول داده‌ها */}
      <div className="bg-backgroundL-500 dark:bg-backgroundD p-4 rounded-lg shadow-xl border border-borderL dark:border-borderD">
        <DataTable
          table={table}
          isLoading={isLoading}
          notFoundMessage="هیچ گروه کاری یافت نشد. می‌توانید با دکمه بالا، گروه جدید ایجاد کنید."
        />
        <div className="pt-4">
          <DataTablePagination table={table} />
        </div>
      </div>

      {/* --- مودال ایجاد گروه کاری (با کامپوننت‌های خودت) --- */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="4xl" // سایز مودال از پراپ‌های کامپوننت خودت
      >
        <ModalHeader onClose={() => setIsCreateModalOpen(false)}>
          <div className="flex flex-col items-start gap-1">
            <span className="text-lg font-bold text-foregroundL dark:text-foregroundD">
              ایجاد گروه کاری جدید
            </span>
            <span className="text-sm font-normal text-muted-foregroundL dark:text-muted-foregroundD">
              مشخصات گروه را وارد کرده و نوع زمان‌بندی آن را تعیین کنید.
            </span>
          </div>
        </ModalHeader>

        <ModalBody>
          <WorkGroupForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </ModalBody>
      </Modal>

    </div>
  );
}

export default WorkGroupPage;