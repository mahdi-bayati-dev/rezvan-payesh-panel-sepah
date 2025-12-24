import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserX, ShieldAlert } from 'lucide-react';
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';
import { useUser } from '@/features/User/hooks/hook';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import UserProfileSidebar from '@/features/User/components/userPage/UserProfileSidebar';
import ProfileTabs from '@/features/User/components/userPage/ProfileTabs';

const MyProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = useAppSelector(selectUser);
    const { data: user, isLoading, isError, error } = useUser(currentUser?.id || 0);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    if (isLoading || !currentUser) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] text-muted-foregroundL dark:text-muted-foregroundD">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primaryL dark:text-primaryD" />
                <span>در حال دریافت اطلاعات کاربری شما...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>خطا در دریافت اطلاعات</AlertTitle>
                    <AlertDescription>{(error as Error)?.message || "مشکلی در ارتباط با سرور پیش آمده است."}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!user?.employee) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] p-8 text-center" dir="rtl">
                <div className="bg-warningL-background dark:bg-warningD-background p-6 rounded-full mb-4">
                    <UserX className="h-12 w-12 text-warningL-foreground dark:text-warningD-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foregroundL dark:text-foregroundD mb-2">اطلاعات سربازی یافت نشد</h2>
                <p className="text-muted-foregroundL dark:text-muted-foregroundD max-w-md">حساب کاربری شما هنوز به هیچ پروفایل سربازی متصل نشده است. لطفاً با مدیر سیستم تماس بگیرید.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6" dir="rtl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-borderL dark:border-borderD pb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold dark:text-borderL">پروفایل من</h1>
                    <p className="text-muted-foregroundL dark:text-muted-foregroundD mt-1">مشاهده و ویرایش اطلاعات شخصی و سازمانی شما</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <aside className="w-full lg:w-1/4 xl:w-1/5 shrink-0 ">
                    <UserProfileSidebar user={user} />
                </aside>
                <main className="flex-1 min-w-0 bg-backgroundL-500 dark:bg-backgroundD rounded-xl shadow-sm p-4">
                    <ProfileTabs user={user} />
                </main>
            </div>
        </div>
    );
};

export default MyProfilePage;