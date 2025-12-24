import { useParams, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/features/User/hooks/hook';
import { Info, ArrowRight } from 'lucide-react';
import UserProfileSidebar from './UserProfileSidebar';
import ProfileTabs from './ProfileTabs';
import { UserProfileSkeleton } from '@/features/User/components/userPage/UserProfileSkeleton';

function UserProfilePage() {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const numericUserId = Number(userId);

    const { data: user, isLoading, isError, error } = useUser(numericUserId);

    if (isLoading) return <UserProfileSkeleton />;

    if (isError) {
        return (
            <div className="p-8 space-y-4" dir="rtl">
                <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>{(error as Error)?.message || "خطا در دریافت اطلاعات کاربر."}</AlertDescription>
                </Alert>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowRight className="h-4 w-4 ml-2" />
                    بازگشت
                </Button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4" dir="rtl">
                <p className="text-muted-foregroundL dark:text-muted-foregroundD">کاربری با این شناسه یافت نشد.</p>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowRight className="h-4 w-4 ml-2" />
                    بازگشت به لیست
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4 m-2 md:p-0 mx-auto " dir="rtl">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-foregroundL dark:text-foregroundD">پرونده الکترونیک سرباز</h1>
                    <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-1">مدیریت اطلاعات فردی، سازمانی و دسترسی‌ها</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="hover:bg-secondaryL dark:hover:bg-secondaryD">
                    <ArrowRight className="h-4 w-4 ml-2" />
                    بازگشت
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <aside className="w-full lg:w-1/4 xl:w-1/5 shrink-0">
                    <UserProfileSidebar user={user} />
                </aside>
                <main className="flex-1 min-w-0 p-4 rounded-xl border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD shadow-sm">
                    <ProfileTabs user={user} />
                </main>
            </div>
        </div>
    );
}

export default UserProfilePage;