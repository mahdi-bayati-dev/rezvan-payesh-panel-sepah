
import { useParams } from 'react-router-dom';

// --- کامپوننت‌های UI (اصلاح مسیر و حروف کوچک) ---
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

// --- هوک‌ها (اصلاح مسیر) ---
import { useUser } from '@/features/User/hooks/hook';

// --- آیکون‌ها ---
import { Loader2, Info } from 'lucide-react';

// --- ✅ کامپوننت‌های اسپلیت‌شده (اصلاح مسیر - حذف پوشه اضافی) ---
import UserProfileSidebar from './UserProfileSidebar';
import ProfileTabs from './ProfileTabs';

/**
 * کامپوننت اصلی صفحه پروفایل کاربر
 * (این کامپوننت در روت /users/:userId رندر می‌شود)
 */
function UserProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const numericUserId = Number(userId);

    // --- ۱. فچ کردن داده‌ها ---
    const {
        data: user,
        isLoading,
        isError,
        error
    } = useUser(numericUserId);

    // --- مدیریت حالت لودینگ ---
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen" dir="rtl">
                <Loader2 className="h-12 w-12 animate-spin text-primaryL" />
                <span className="mr-3">در حال بارگذاری اطلاعات کاربر...</span>
            </div>
        );
    }

    // --- مدیریت حالت خطا ---
    if (isError) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>
                        {(error as Error)?.message || "خطا در دریافت اطلاعات کاربر."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // --- مدیریت عدم وجود کاربر ---
    if (!user) {
        return <div className="p-8 text-center" dir="rtl">کاربری یافت نشد.</div>;
    }

    // --- ۲. چیدمان صفحه (Layout) ---
    return (
        <div className="flex flex-col md:flex-row m-2  md:p-0  mx-auto  md:gap-2" dir="rtl">

            {/* سایدبار پروفایل (سمت راست در RTL) */}
            <aside className="w-full md:w-1/3 lg:w-1/4">
                {/* ✅ استفاده از کامپوننت ایمپورت‌شده */}
                <UserProfileSidebar user={user} />
            </aside>

            {/* محتوای اصلی (سمت چپ در RTL) */}
            <main className="flex-1  p-4 rounded-lg   bg-backgroundL-500 dark:bg-backgroundD">
                {/* ✅ استفاده از کامپوننت ایمپورت‌شده */}
                <ProfileTabs user={user} />
            </main>
        </div>
    );
}

export default UserProfilePage;


