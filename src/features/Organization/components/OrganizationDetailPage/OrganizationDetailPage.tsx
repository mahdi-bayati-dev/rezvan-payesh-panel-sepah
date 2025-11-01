
import { useParams } from 'react-router-dom';

// --- ۱. ایمپورت کامپوننت جدید لیست کاربران ---
import { UserListPage } from '@/features/User/components/UserListPage';
import { Loader2 } from 'lucide-react';

/**
 * این کامپوننت صفحه‌ای است که در مسیر /organizations/:id رندر می‌شود
 * و به عنوان یک "Wrapper" عمل می‌کند تا UserListPage را با ID صحیح رندر کند.
 */
function OrganizationDetailPage() {
    // ۱. گرفتن ID از URL
    const { id } = useParams<{ id: string }>();

    // (ممکن است id در لحظه اول undefined باشد)
    if (id === undefined) {
        return (
            <div className="flex justify-center items-center h-64" dir="rtl">
                <Loader2 className="h-12 w-12 animate-spin" />
                <span className="mr-3">در حال بارگذاری...</span>
            </div>
        );
    }

    const organizationId = Number(id);

    // ۲. بررسی معتبر بودن ID
    if (isNaN(organizationId)) {
        return (
            <div className="p-8 text-center" dir="rtl">
                <h1 className="text-xl text-red-600">
                    خطا: ID سازمان نامعتبر است.
                </h1>
            </div>
        );
    }

    // ۳. رندر کامپوننت اصلی لیست کاربران و پاس دادن ID
    return (
        <UserListPage organizationId={organizationId} />
    );
}

export default OrganizationDetailPage;

