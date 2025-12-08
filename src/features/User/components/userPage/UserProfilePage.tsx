import { useParams, useNavigate } from 'react-router-dom';

// --- کامپوننت‌های UI ---
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

// --- هوک‌ها ---
import { useUser } from '@/features/User/hooks/hook';

// --- آیکون‌ها ---
import { Info, ArrowRight } from 'lucide-react';

// --- کامپوننت‌های فرزند ---
import UserProfileSidebar from './UserProfileSidebar';
import ProfileTabs from './ProfileTabs';
import { UserProfileSkeleton } from '@/features/User/components/userPage/UserProfileSkeleton'; // ✅ ایمپورت اسکلت جدید

/**
 * کامپوننت اصلی صفحه پروفایل کاربر
 * مسیر: /organizations/users/:userId
 */
function UserProfilePage() {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const numericUserId = Number(userId);

    // --- ۱. فچ کردن داده‌ها ---
    const {
        data: user,
        isLoading,
        isError,
        error
    } = useUser(numericUserId);

    // --- مدیریت حالت لودینگ (جایگزین شده با اسکلت) ---
    if (isLoading) {
        return <UserProfileSkeleton />; // ✅ نمایش اسکلت بجای اسپینر
    }

    // --- مدیریت حالت خطا ---
    if (isError) {
        return (
            <div className="p-8 space-y-4" dir="rtl">
                <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>
                        {(error as Error)?.message || "خطا در دریافت اطلاعات کاربر."}
                    </AlertDescription>
                </Alert>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowRight className="h-4 w-4 ml-2" />
                    بازگشت
                </Button>
            </div>
        );
    }

    // --- مدیریت عدم وجود کاربر ---
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4" dir="rtl">
                <p className="text-muted-foregroundL">کاربری با این شناسه یافت نشد.</p>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowRight className="h-4 w-4 ml-2" />
                    بازگشت به لیست
                </Button>
            </div>
        );
    }

    // --- ۲. چیدمان صفحه (Layout) ---
    return (
        <div className="space-y-4 m-2 md:p-0 mx-auto max-w-7xl" dir="rtl">

            {/* هدر صفحه: شامل عنوان و دکمه بازگشت */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-foregroundL dark:text-foregroundD">
                        پرونده الکترونیک کارمند
                    </h1>
                    <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                        مدیریت اطلاعات فردی، سازمانی و دسترسی‌ها
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="hover:bg-secondaryL dark:hover:bg-secondaryD"
                >
                    <ArrowRight className="h-4 w-4 ml-2" />
                    بازگشت
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                {/* سایدبار پروفایل (اطلاعات خلاصه) */}
                <aside className="w-full lg:w-1/4 xl:w-1/5 shrink-0">
                    <UserProfileSidebar user={user} />
                </aside>

                {/* محتوای اصلی (فرم‌ها و تب‌ها) */}
                <main className="flex-1 min-w-0 p-4 rounded-xl border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD shadow-sm">
                    <ProfileTabs user={user} />
                </main>
            </div>
        </div>
    );
}

export default UserProfilePage;