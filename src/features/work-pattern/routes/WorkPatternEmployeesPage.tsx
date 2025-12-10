import  { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, Search, UserPlus, ShieldCheck } from "lucide-react";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";

// Imported Logic & Config
import { useManageEmployeesLogic } from "@/features/work-pattern/hooks/logic/useManageEmployeesLogic";
import { getAssignedColumns, getAvailableColumns } from "@/features/work-pattern/components/employees/employeeColumns";
import { EmployeeTableCard } from "@/features/work-pattern/components/employees/EmployeeTableCard";

export default function ManagePatternEmployeesPage() {
    const navigate = useNavigate();

    const {
        assignedUsers, availableUsers, patternName,
        isLoading, isMutating, isUsersError, usersError,
        searchTerm, setSearchTerm,
        handleAssignUser, handleRemoveUser, isValidId
    } = useManageEmployeesLogic();

    // ستون‌ها حالا فقط زمانی تغییر می‌کنند که هندلرها یا وضعیت لودینگ واقعاً تغییر کند
    const assignedColumns = useMemo(
        () => getAssignedColumns(handleRemoveUser, isMutating),
        [handleRemoveUser, isMutating]
    );

    const availableColumns = useMemo(
        () => getAvailableColumns(handleAssignUser, isMutating),
        [handleAssignUser, isMutating]
    );

    if (!isValidId) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>شناسهٔ الگو نامعتبر است.</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto" dir="rtl">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-borderL dark:border-borderD pb-5">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primaryL/10 rounded-lg dark:bg-primaryD/10">
                            <Users className="h-6 w-6 text-primaryL dark:text-primaryD" />
                        </div>
                        <h1 className="text-2xl font-bold text-foregroundL dark:text-foregroundD">مدیریت کارمندان الگو</h1>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foregroundL">
                        <span>مدیریت کاربران متصل به:</span>
                        {isLoading ? (
                            <Skeleton className="h-5 w-32 inline-block" />
                        ) : (
                            <span className="font-bold text-foregroundL bg-secondaryL/50 px-2 py-0.5 rounded text-xs dark:text-foregroundD dark:bg-secondaryD/50">
                                {patternName}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foregroundL" />
                        <Input
                            label=""
                            placeholder="جستجو نام یا کد پرسنلی..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-9 h-10 bg-white dark:bg-backgroundD"
                        />
                    </div>
                    <Button variant="outline" onClick={() => navigate("/work-patterns")} className="h-10 gap-2">
                        <ArrowRight className="h-4 w-4" />
                        بازگشت
                    </Button>
                </div>
            </div>

            {/* Content */}
            {isUsersError ? (
                <div className="p-8">
                    <Alert variant="destructive" className="max-w-2xl mx-auto">
                        <AlertTitle>خطا</AlertTitle>
                        <AlertDescription>{(usersError as Error)?.message ?? "خطای نامشخص"}</AlertDescription>
                    </Alert>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <EmployeeTableCard
                        title="کارمندان متصل"
                        icon={<ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                        count={assignedUsers.length}
                        description="لیست افرادی که هم‌اکنون از این الگو استفاده می‌کنند."
                        data={assignedUsers}
                        columns={assignedColumns}
                        isLoading={isLoading}
                        emptyMessage="هیچ کارمندی به این الگو متصل نیست."
                        headerClassName="bg-emerald-50/50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/20"
                    />

                    <EmployeeTableCard
                        title="سایر کارمندان"
                        icon={<UserPlus className="h-5 w-5 text-stone-600 dark:text-stone-400" />}
                        count={availableUsers.length}
                        description="برای افزودن، دکمه افزودن را بزنید."
                        data={availableUsers}
                        columns={availableColumns}
                        isLoading={isLoading}
                        emptyMessage="کارمند دیگری یافت نشد."
                    />
                </div>
            )}
        </div>
    );
}