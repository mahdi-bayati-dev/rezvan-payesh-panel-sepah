// features/requests/routes/RequestDetailPage.tsx

import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns-jalali';
import { toast } from 'react-toastify';

import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';
import { type User } from '@/features/requests/types';

import {
  useLeaveRequestById,
  useProcessLeaveRequest
} from '@/features/requests/hook/useLeaveRequests';

import { RequesterInfoCard } from '@/features/requests/components/requestDetails/RequesterInfoCard';
import { RequestInfoCard } from '@/features/requests/components/requestDetails/RequestInfoCard';
import { RequestActionsPanel } from '@/features/requests/components/requestDetails/RequestActionsPanel';

import type { SelectOption } from '@/components/ui/SelectBox';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

const RequestDetailHeader = ({ number, date }: { number: string; date: string }) => (
  <div className="flex justify-between items-center pb-4 border-b border-borderL dark:border-borderD">
    <h2 className="text-xl font-bold text-right text-foregroundL dark:text-foregroundD">
      مشاهده درخواست
    </h2>
    <div className="flex gap-4 text-sm text-muted-foregroundL dark:text-muted-foregroundD">
      <span>{`#${number}`}</span>
      <span>{date}</span>
    </div>
  </div>
);

const statusOptions: SelectOption[] = [
  { id: 'approved', name: 'تایید شده' },
  { id: 'rejected', name: 'رد شده' },
  { id: 'pending', name: 'در حال بررسی' },
];

const RequestDetailPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const numericRequestId = Number(requestId);

  const currentUser = useAppSelector(selectUser) as User | null;

  const isManager = useMemo(() => {
    if (!currentUser?.roles) return false;
    return (
      currentUser.roles.includes("super_admin") ||
      currentUser.roles.includes("org-admin-l2") ||
      currentUser.roles.includes("org-admin-l3")
    );
  }, [currentUser]);

  const {
    data: requestData,
    isLoading,
    isError,
    error,
  } = useLeaveRequestById(numericRequestId);

  const request = useMemo(() => requestData?.data, [requestData]);
  const processMutation = useProcessLeaveRequest();
  const isSubmitting = processMutation.isPending;

  const [status, setStatus] = useState<SelectOption | null>(null);
  const [adminResponse, setAdminResponse] = useState('');

  // ✅ [جدید] استیت برای نگهداری خطای اعتبارسنجی سمت کلاینت
  const [validationError, setValidationError] = useState<string | null>(null);

  useMemo(() => {
    if (request) {
      const currentStatus = statusOptions.find(s => s.id === request.status);
      setStatus(currentStatus || null);
      setAdminResponse(request.rejection_reason || '');
    }
  }, [request]);

  // ✅ [بهبود یافته] هندلر تایید با منطق "توقف و نمایش خطا" (Fail-Fast)
  const handleConfirm = async () => {
    // ۱. ریست کردن خطاها
    setValidationError(null);

    if (!request || !status) {
      toast.error("لطفا ابتدا وضعیت درخواست را مشخص کنید.");
      return;
    }

    const trimmedResponse = adminResponse.trim();

    // ۲. قانون بیزنس: اگر "رد" انتخاب شد، توضیحات اجباری است.
    // این کار باعث می‌شود کاربر قبل از ارسال درخواست به سرور متوجه اشتباه شود.
    if (status.id === 'rejected' && !trimmedResponse) {
      const errorMsg = "برای رد کردن درخواست، وارد کردن دلیل (توضیحات) الزامی است.";
      setValidationError(errorMsg);
      return; // اینجا تابع قطع می‌شود و درخواستی به سرور نمی‌رود
    }

    const payload = {
      status: status.id as "approved" | "rejected",
      rejection_reason: trimmedResponse || undefined,
    };

    processMutation.mutate(
      { id: request.id, payload },
      {
        // لاجیک onSuccess/onError در هوک مدیریت می‌شود
      }
    );
  };

  const handleCancel = () => {
    navigate('/requests');
  };

  const handleExport = () => {
    alert("خروجی PDF آماده شد (شبیه‌سازی)");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner text="در حال بارگذاری جزئیات درخواست..." size="lg" />
      </div>
    );
  }
  if (isError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>خطا در دریافت اطلاعات</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    );
  }
  if (!request) {
    return (
      <Alert variant="warning" className="m-4">
        <AlertTitle>یافت نشد</AlertTitle>
        <AlertDescription>
          درخواستی با این شناسه یافت نشد یا شما دسترسی لازم برای مشاهده آن را ندارید.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-6 p-4 sm:p-6">

      <main className="flex-1 flex flex-col gap-6 p-4 sm:p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
        <RequestDetailHeader
          number={String(request.id)}
          date={format(parseISO(request.created_at), 'yyyy/MM/dd')}
        />
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="w-full xl:w-80">
            <RequesterInfoCard request={request} />
          </div>
          <div className="flex-1">
            <RequestInfoCard request={request} />
          </div>
        </div>
      </main>

      <aside className="w-full md:w-72 xl:w-80 flex-shrink-0">

        {isManager ? (
          <RequestActionsPanel
            request={request}
            status={status}
            // UX: با تغییر انتخاب، خطای قبلی را پاک کن
            onStatusChange={(val) => { setStatus(val); if (val) setValidationError(null); }}
            response={adminResponse}
            // UX: با تایپ کردن، خطای قبلی را پاک کن
            onResponseChange={(val) => { setAdminResponse(val); if (val) setValidationError(null); }}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onExport={handleExport}
            isSubmitting={isSubmitting}
            // ارسال خطا به کامپوننت UI
            errorMessage={validationError}
          />
        ) : (
          <div className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD text-sm text-center text-muted-foregroundL dark:text-muted-foregroundD">
            نتیجه درخواست در انتهای صفحه و پس از بررسی توسط مدیر ثبت می‌شود.
          </div>
        )}

      </aside>
    </div>
  );
};

export default RequestDetailPage;