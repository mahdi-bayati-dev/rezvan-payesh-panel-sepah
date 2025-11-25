import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserX, ShieldAlert } from 'lucide-react';

// --- Redux Hooks ---
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';

// --- Custom Hooks ---
// از همان هوک useUser استفاده می‌کنیم تا اطلاعات کامل و به‌روز را بگیریم
import { useUser } from '@/features/User/hooks/hook';

// --- UI Components ---
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
// استفاده مجدد از کامپوننت‌های موجود (اصل ماژولار بودن)
import UserProfileSidebar from '@/features/User/components/userPage/UserProfileSidebar';
import ProfileTabs from '@/features/User/components/userPage/ProfileTabs';

/**
 * کامپوننت صفحه "اطلاعات من"
 * این صفحه مخصوص کاربر جاری است و نیازی به ID در URL ندارد.
 */
const MyProfilePage: React.FC = () => {
    const navigate = useNavigate();

    // ۱. دریافت اطلاعات اولیه از ریداکس (کاربر لاگین شده)
    const currentUser = useAppSelector(selectUser);

    // ۲. فچ کردن اطلاعات تازه‌ترین وضعیت کاربر از سرور
    // نکته: ما به دیتای ریداکس اکتفا نمی‌کنیم چون ممکن است اطلاعات تغییر کرده باشد
    // و ما نیاز به ریلیشن‌های کامل (مثل employee.organization) داریم.
    const {
        data: user,
        isLoading,
        isError,
        error
    } = useUser(currentUser?.id || 0);

    // ۳. ریدایرکت اگر کاربر لاگین نباشد (لایه امنیتی کلاینت)
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    // --- حالت لودینگ ---
    if (isLoading || !currentUser) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] text-muted-foregroundL dark:text-muted-foregroundD">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primaryL" />
                <span>در حال دریافت اطلاعات کاربری شما...</span>
            </div>
        );
    }

    // --- حالت خطا ---
    if (isError) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>خطا در دریافت اطلاعات</AlertTitle>
                    <AlertDescription>
                        {(error as Error)?.message || "مشکلی در ارتباط با سرور پیش آمده است."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // --- بررسی حیاتی: آیا کاربر اطلاعات کارمندی دارد؟ ---
    // طبق درخواست شما، این صفحه فقط برای کسانی است که `employee` دارند.
    if (!user?.employee) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] p-8 text-center" dir="rtl">
                <div className="bg-warning-50 dark:bg-warning-900/20 p-6 rounded-full mb-4">
                    <UserX className="h-12 w-12 text-warning-600 dark:text-warning-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    اطلاعات کارمندی یافت نشد
                </h2>
                <p className="text-muted-foregroundL dark:text-muted-foregroundD max-w-md">
                    حساب کاربری شما هنوز به هیچ پروفایل کارمندی متصل نشده است. لطفاً با مدیر سیستم تماس بگیرید.
                </p>
            </div>
        );
    }

    // --- رندر نهایی (مشابه UserProfilePage اما برای خود کاربر) ---
    return (
        <div className="p-4 md:p-8 space-y-6" dir="rtl">
            {/* هدر صفحه */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-borderL dark:border-borderD pb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold dark:text-borderL">
                        پروفایل من
                    </h1>
                    <p className="text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                        مشاهده و ویرایش اطلاعات شخصی و سازمانی شما
                    </p>
                </div>
            </div>

            {/* چیدمان اصلی */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* ستون کناری: کارت اطلاعات کلی */}
                <aside className="w-full lg:w-1/4 xl:w-1/5 shrink-0 ">
                    <UserProfileSidebar user={user} />
                </aside>

                {/* ستون اصلی: فرم‌ها و تب‌ها */}
                <main className="flex-1 min-w-0 bg-backgroundL-500 dark:bg-backgroundD rounded-xl shadow-sm  p-4">
                    {/* استفاده مجدد از کامپوننت تب‌ها */}
                    <ProfileTabs user={user} />
                </main>
            </div>
        </div>
    );
};

export default MyProfilePage;