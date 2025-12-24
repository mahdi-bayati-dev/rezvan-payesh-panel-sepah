import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, ArrowRight, Search, UserPlus, Briefcase } from "lucide-react";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";

import { useManageWorkGroupEmployeesLogic } from "@/features/work-group/hooks/logic/useManageWorkGroupEmployeesLogic";
import { getAssignedGroupColumns, getAvailableGroupColumns } from "@/features/work-group/components/assignment/workGroupEmployeeColumns";
import { ServerEmployeeTableCard } from "@/features/work-group/components/assignment/ServerEmployeeTableCard";

export default function WorkGroupAssignmentPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        isValidId,
        groupName,
        searchTerm,
        setSearchTerm,
        isLoading,
        pendingUserId,
        isMutating,
        assignedUsers,
        assignedPagination,
        setAssignedPagination,
        assignedPageCount,
        assignedTotal,
        assignedRowSelection,
        setAssignedRowSelection,
        availableUsers,
        availablePagination,
        setAvailablePagination,
        availablePageCount,
        availableTotal,
        availableRowSelection,
        setAvailableRowSelection,
        handleAssignUser,
        handleRemoveUser,
        handleBulkAssign,
        handleBulkRemove,
    } = useManageWorkGroupEmployeesLogic();

    const assignedColumns = useMemo(
        () => getAssignedGroupColumns(handleRemoveUser, pendingUserId),
        [handleRemoveUser, pendingUserId]
    );

    const availableColumns = useMemo(
        () => getAvailableGroupColumns(handleAssignUser, pendingUserId),
        [handleAssignUser, pendingUserId]
    );

    if (!isValidId) {
        return (
            <div className="p-8 max-w-4xl mx-auto" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>شناسهٔ گروه کاری نامعتبر است.</AlertDescription>
                </Alert>
                <Button variant="outline" onClick={() => navigate("/work-groups")} className="mt-4">
                    بازگشت
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto" dir="rtl">

            {/* --- Header --- */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-borderL dark:border-borderD pb-5">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primaryL/10 dark:bg-primaryD/10 rounded-lg shadow-sm">
                            <Users className="h-6 w-6 text-primaryL dark:text-primaryD" />
                        </div>
                        <h1 className="text-2xl font-bold text-foregroundL dark:text-foregroundD">
                            مدیریت اعضای گروه کاری
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                        <span>مدیریت کاربران متصل به:</span>
                        {isLoading ? (
                            <Skeleton className="h-5 w-32 inline-block rounded" />
                        ) : (
                            <span className="font-bold text-primaryL bg-primaryL/5 px-2 py-0.5 rounded text-xs dark:text-primaryD dark:bg-primaryD/10 border border-primaryL/10 dark:border-primaryD/20">
                                {groupName}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foregroundL group-hover:text-primaryL transition-colors" />
                        <Input
                            label=""
                            placeholder="جستجو نام یا کد پرسنلی..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-9 h-10 bg-backgroundL-500 dark:bg-backgroundD border-borderL dark:border-borderD focus:ring-1 focus:ring-primaryL"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/work-groups/${id}`)}
                        className="h-10 gap-2 shrink-0 hover:bg-secondaryL dark:hover:bg-secondaryD"
                    >
                        <ArrowRight className="h-4 w-4" />
                        بازگشت
                    </Button>
                </div>
            </div>

            {/* --- Content Grid --- */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* کارت ۱: اعضای متصل (با قابلیت حذف گروهی) */}
                <ServerEmployeeTableCard
                    title="اعضای گروه"
                    icon={<Briefcase className="h-5 w-5 text-primaryL dark:text-primaryD" />}
                    count={assignedTotal}
                    description="لیست کاربرانی که عضو این گروه کاری هستند."
                    data={assignedUsers}
                    columns={assignedColumns}
                    isLoading={isLoading}
                    emptyMessage="هیچ عضوی در این گروه یافت نشد."
                    // اصلاح رنگ هدر: استفاده از primaryL با opacity کم
                    headerClassName="bg-primaryL/5 dark:bg-primaryD/5 border-b border-primaryL/10 dark:border-primaryD/10"
                    pageCount={assignedPageCount}
                    pagination={assignedPagination}
                    onPaginationChange={setAssignedPagination}
                    rowSelection={assignedRowSelection}
                    onRowSelectionChange={setAssignedRowSelection}
                    bulkAction={{
                        label: 'حذف انتخاب‌شده‌ها',
                        onClick: handleBulkRemove,
                        isLoading: isMutating,
                        variant: 'destructive'
                    }}
                />

                {/* کارت ۲: اعضای قابل افزودن (با قابلیت افزودن گروهی) */}
                <ServerEmployeeTableCard
                    title="سربازان آزاد"
                    icon={<UserPlus className="h-5 w-5 text-successL-foreground dark:text-successD-foreground" />}
                    count={availableTotal}
                    description="سربازانی که در هیچ گروهی عضو نیستند و می‌توانند اضافه شوند."
                    data={availableUsers}
                    columns={availableColumns}
                    isLoading={isLoading}
                    emptyMessage="سرباز آزادی یافت نشد."
                    // اصلاح رنگ هدر: استفاده از successL با opacity کم
                    headerClassName="bg-successL-background/50 dark:bg-successD-background/10 border-b border-successL-foreground/10 dark:border-successD-foreground/10"
                    pageCount={availablePageCount}
                    pagination={availablePagination}
                    onPaginationChange={setAvailablePagination}
                    rowSelection={availableRowSelection}
                    onRowSelectionChange={setAvailableRowSelection}
                    bulkAction={{
                        label: 'افزودن انتخاب‌شده‌ها',
                        onClick: handleBulkAssign,
                        isLoading: isMutating,
                        variant: 'primary'
                    }}
                />
            </div>
        </div>
    );
}