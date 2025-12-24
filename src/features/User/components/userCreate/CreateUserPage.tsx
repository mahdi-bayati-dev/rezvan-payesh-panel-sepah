import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreateUserForm } from './CreateUserForm';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useOrganization } from '@/features/Organization/hooks/useOrganizations';

function CreateUserPage() {
    const navigate = useNavigate();
    const { id: orgIdParam } = useParams<{ id: string }>();
    const organizationId = useMemo(() => orgIdParam ? Number(orgIdParam) : NaN, [orgIdParam]);
    const { data: organization, isLoading: isLoadingOrg } = useOrganization(organizationId);

    if (isNaN(organizationId)) {
        return (
            <div className="p-8 text-center text-destructiveL dark:text-destructiveD" dir="rtl">
                خطا: ID سازمان نامعتبر است. (پارامتر دریافتی از URL: {orgIdParam || "undefined"})
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto" dir="rtl">
            <div className="flex justify-between items-center pb-4 border-b border-borderL dark:border-borderD">
                <div>
                    <h1 className="text-2xl font-bold dark:text-borderL">ایجاد سرباز جدید</h1>
                    <p className="text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                        {isLoadingOrg ? <Loader2 className="h-4 w-4 animate-spin" /> : `در سازمان: ${organization?.name || `(ID: ${organizationId})`}`}
                    </p>
                </div>
                <Button variant="outline" size="md" onClick={() => navigate(-1)}>
                    <ArrowRight className="h-4 w-4 ml-2" />
                    بازگشت به لیست
                </Button>
            </div>

            <div className="p-6 rounded-lg border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD">
                <CreateUserForm organizationId={organizationId} />
            </div>
        </div>
    );
}

export default CreateUserPage;