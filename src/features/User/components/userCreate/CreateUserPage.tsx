// User/components/userCreate/CreateUserPage.tsx

import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ✅ ایمپورت فرمی که در قدم بعد می‌سازیم
import { CreateUserForm } from './CreateUserForm';
import { Button } from '@/components/ui/Button'; // ✅ (مطمئن شویم از حروف کوچک استفاده می‌کند)
import { ArrowRight, Loader2 } from 'lucide-react';

// (هوک useOrganization برای گرفتن نام سازمان)
import { useOrganization } from '@/features/Organization/hooks/useOrganizations';


/**
 * این صفحه در مسیر /organizations/:id/create-user رندر می‌شود
 */
function CreateUserPage() {
    const navigate = useNavigate();

    // --- ✅ رفع خطا: ---
    // فایل روتینگ شما از پارامتر :id استفاده می‌کند.
    // ما باید به جای organizationId از 'id' استفاده کنیم.
    const { id: orgIdParam } = useParams<{ id: string }>();

    // ۱. اطمینان از اعتبار ID سازمان
    const organizationId = useMemo(() => orgIdParam ? Number(orgIdParam) : NaN, [orgIdParam]);

    // ۲. فچ کردن نام سازمان (برای نمایش در هدر)
    // (این هوک useOrganization از فایل‌های سازمان شما می‌آید)
    const { data: organization, isLoading: isLoadingOrg } = useOrganization(organizationId);

    // ۳. بررسی خطا (اینجا جایی است که خطای شما رخ می‌داد)
    if (isNaN(organizationId)) {
        return (
            <div className="p-8 text-center text-red-600" dir="rtl">
                {/* (برای دیباگ بهتر، پارامتر دریافتی را هم نشان می‌دهیم) */}
                خطا: ID سازمان نامعتبر است. (پارامتر دریافتی از URL: {orgIdParam || "undefined"})
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto" dir="rtl">
            {/* هدر صفحه */}
            <div className="flex justify-between items-center pb-4 border-b border-borderL dark:border-borderD">
                <div>
                    <h1 className="text-2xl font-bold dark:text-borderL">
                        ایجاد کارمند جدید
                    </h1>
                    <p className="text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                        {isLoadingOrg ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            // (اگر سازمان پیدا نشد، حداقل ID را نشان می‌دهیم)
                            `در سازمان: ${organization?.name || `(ID: ${organizationId})`}`
                        )}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="md"
                    onClick={() => navigate(-1)} // بازگشت به صفحه لیست
                >
                    <ArrowRight className="h-4 w-4 ml-2" />
                    بازگشت به لیست
                </Button>
            </div>

            {/* کانتینر فرم */}
            <div className="p-6 rounded-lg border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD">
                {/* کامپوننت فرم اصلی که ID سازمان را به عنوان prop می‌گیرد
                  تا در مقادیر پیش‌فرض فرم استفاده شود.
                */}
                <CreateUserForm organizationId={organizationId} />
            </div>
        </div>
    );
}

export default CreateUserPage;