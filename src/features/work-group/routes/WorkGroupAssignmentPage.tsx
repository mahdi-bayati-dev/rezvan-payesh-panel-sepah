// import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// --- هوک‌ها و تایپ‌ها ---
import { useWorkGroup } from '@/features/work-group/hooks/hook';
// import { type WorkGroup } from '@/features/work-group/types';
// import { WorkGroupForm } from '@/features/work-group/components/newWorkGroup/WorkGroupForm';

// --- کامپوننت‌های جدید جدول ---
import AssignedEmployeesTable from '@/features/work-group/components/assignment/AssignedEmployeesTable';
import AvailableEmployeesTable from '@/features/work-group/components/assignment/AvailableEmployeesTable';

// --- کامپوننت‌های UI ---
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2, ArrowRight, Users, UserPlus, UserMinus } from 'lucide-react';
// import { Separator } from '@/components/ui/Separator'; // ❌ حذف شد

/**
 * صفحه مدیریت تخصیص کارمندان به یک گروه کاری خاص
 */
function WorkGroupAssignmentPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const numericId = id ? parseInt(id, 10) : 0;
    const backToDetail = () => navigate(`/work-groups/${numericId}`);

    // --- ۱. فچ کردن داده‌های گروه کاری (برای نمایش نام) ---
    const { data: workGroup, isLoading, isError, error } = useWorkGroup(numericId);

    // --- مدیریت لودینگ و خطا ---
    if (isLoading) {
        return (
            <div className="p-8 max-w-6xl mx-auto flex justify-center items-center h-64" dir="rtl">
                <Loader2 className="h-12 w-12 animate-spin text-primaryL dark:text-primaryD" />
                <span className="mr-4 text-lg">در حال بارگذاری اطلاعات گروه کاری...</span>
            </div>
        );
    }

    if (isError || !workGroup) {
        return (
            <div className="p-8 max-w-6xl mx-auto" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطا در بارگذاری گروه</AlertTitle>
                    <AlertDescription>
                        <p>{isError ? (error as any)?.message || "خطا در برقراری ارتباط با سرور." : "گروه کاری مورد نظر یافت نشد."}</p>
                        <Button variant="link" onClick={() => navigate('/work-groups')} className="pr-0 mt-2">
                            بازگشت به لیست
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto" dir="rtl">

            {/* هدر صفحه */}
            <div className="flex justify-between items-center pb-4 border-b border-borderL dark:border-borderD">
                <div>
                    <h1 className="text-3xl font-bold dark:text-borderL flex items-center gap-2">
                        <Users className="h-7 w-7 text-primaryL dark:text-primaryD" />
                        مدیریت کارمندان گروه: <span className='text-primaryL dark:text-primaryD'>{workGroup.name}</span>
                    </h1>
                    <p className="mt-2 text-muted-foregroundL dark:text-muted-foregroundD">
                        در این صفحه می‌توانید اعضای فعلی گروه را مشاهده و کارمندان جدید را تخصیص دهید.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={backToDetail}
                    className="hover:bg-backgroundL-300 dark:hover:bg-backgroundD-700 transition-colors"
                >
                    <ArrowRight className="h-4 w-4 ml-2" />
                    بازگشت به جزئیات گروه
                </Button>
            </div>

            {/* --- دو ستون اصلی: کارمندان فعلی و کارمندان قابل افزودن --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* ستون ۱: کارمندان فعلی گروه */}
                <div className='space-y-4'>
                    <div className="flex items-center gap-2 text-xl font-semibold text-foregroundL dark:text-foregroundD">
                        <UserMinus className="h-6 w-6 text-red-500" />
                        <span>اعضای فعلی گروه</span>
                    </div>
                    <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                        لیست کارمندانی که در حال حاضر عضو **{workGroup.name}** هستند.
                    </p>
                    <AssignedEmployeesTable groupId={numericId} groupName={workGroup.name} />
                </div>

                {/* ✅ جایگزینی Separator با یک خط ساده مرزی (border-t) */}
                <div className='lg:hidden border-t border-dashed border-borderL dark:border-borderD my-4'></div>

                {/* ستون ۲: کارمندان قابل افزودن (خارج از گروه) */}
                <div className='space-y-4'>
                    <div className="flex items-center gap-2 text-xl font-semibold text-foregroundL dark:text-foregroundD">
                        <UserPlus className="h-6 w-6 text-green-600" />
                        <span>کارمندان قابل افزودن</span>
                    </div>
                    <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                        لیست کارمندانی که هنوز به **{workGroup.name}** تخصیص داده نشده‌اند.
                    </p>
                    <AvailableEmployeesTable groupId={numericId} groupName={workGroup.name} />
                </div>

            </div>
        </div>
    );
}

export default WorkGroupAssignmentPage;