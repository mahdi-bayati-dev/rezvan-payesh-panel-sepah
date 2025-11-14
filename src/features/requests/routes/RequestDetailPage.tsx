// features/requests/routes/RequestDetailPage.tsx

import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns-jalali';

// --- ✅ ۱. ایمپورت‌های مورد نیاز برای بررسی دسترسی ---
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';
import { type User } from '@/features/requests/types';
// ---------------------------------------------------

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

// (هدر صفحه بدون تغییر)
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

// (گزینه‌های وضعیت بدون تغییر)
const statusOptions: SelectOption[] = [
  { id: 'approved', name: 'تایید شده' },
  { id: 'rejected', name: 'رد شده' },
  { id: 'pending', name: 'در حال بررسی' },
];


const RequestDetailPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const numericRequestId = Number(requestId);

  // --- ✅ ۲. دریافت اطلاعات کاربر فعلی از Redux ---
  const currentUser = useAppSelector(selectUser) as User | null;

  // --- ۳. تشخیص اینکه آیا کاربر فعلی "مدیر" است یا "کاربر" ---
  const isManager = useMemo(() => {
    if (!currentUser?.roles) return false;
    // بر اساس مستندات API، این سه رول مدیر محسوب می‌شوند
    return (
      currentUser.roles.includes("super_admin") ||
      currentUser.roles.includes("org-admin-l2") ||
      currentUser.roles.includes("org-admin-l3")
    );
  }, [currentUser]);

  // --- ۴. اتصال به React Query (بدون تغییر) ---
  const {
    data: requestData,
    isLoading,
    isError,
    error,
  } = useLeaveRequestById(numericRequestId);

  const request = useMemo(() => requestData?.data, [requestData]);
  const processMutation = useProcessLeaveRequest();
  const isSubmitting = processMutation.isPending;

  // --- ۵. State های محلی (بدون تغییر) ---
  const [status, setStatus] = useState<SelectOption | null>(null);
  const [adminResponse, setAdminResponse] = useState('');

  useMemo(() => {
    if (request) {
      const currentStatus = statusOptions.find(s => s.id === request.status);
      setStatus(currentStatus || null);
      setAdminResponse(request.rejection_reason || '');
    }
  }, [request]);


  // --- ۶. توابع مدیریت‌کننده (بدون تغییر) ---
  const handleConfirm = async () => {
    if (!request || !status) {
      alert("داده‌های درخواست کامل نیست.");
      return;
    }
    const payload = {
      status: status.id as "approved" | "rejected",
      rejection_reason: status.id === 'rejected' ? adminResponse : undefined,
    };
    processMutation.mutate(
      { id: request.id, payload },
      {
        // (onSuccess/onError در هوک مدیریت می‌شود)
      }
    );
  };

  const handleCancel = () => {
    navigate('/requests');
  };

  const handleExport = () => {
    console.log("در حال آماده‌سازی خروجی برای درخواست:", request?.id);
    alert("خروجی PDF آماده شد (شبیه‌سازی)");
  };

  // --- ۷. مدیریت حالات لودینگ و خطا (بدون تغییر) ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner text="در حال بارگذاری جزئیات درخواست..." size="lg" />
      </div>
    );
  }
  // (ادامه مدیریت خطاها...)
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

  // --- ۸. رندر صفحه اصلی ---
  return (
    <div className="flex flex-col-reverse md:flex-row gap-6 p-4 sm:p-6"> {/* ✅ ریسپانسیو: padding مناسب */}

      {/* کارت اصلی محتوا (بدون تغییر) */}
      <main className="flex-1 flex flex-col gap-6 p-4 sm:p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD"> {/* ✅ ریسپانسیو: padding مناسب */}
        <RequestDetailHeader
          number={String(request.id)}
          date={format(parseISO(request.created_at), 'yyyy/MM/dd')}
        />
        {/* ✅ ریسپانسیو: محتوای داخلی را در موبایل عمودی و در دسکتاپ افقی نمایش بده */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* ✅ ریسپانسیو: در موبایل تمام عرض و در دسکتاپ عرض مشخص */}
          <div className="w-full xl:w-80">
            <RequesterInfoCard request={request} />
          </div>
          <div className="flex-1">
            {/* کارت اطلاعات درخواست (RequestInfoCard)
              در فایل بعدی (RequestInfoCard.tsx) اصلاح می‌شود
              تا نتیجه (دلیل رد) را نمایش دهد.
            */}
            <RequestInfoCard request={request} />
          </div>
        </div>
      </main>

      {/* سایدبار (گزینه‌ها) */}
      <aside className="w-full md:w-72 xl:w-80 flex-shrink-0"> {/* ✅ ریسپانسیو: عرض ثابت برای سایدبار */}

        {/* --- ✅ [رفع باگ ۱] اعمال دسترسی --- */}
        {/* پنل اکشن (تایید/رد) فقط زمانی نمایش داده می‌شود
          که کاربر لاگین کرده، "مدیر" باشد.
        */}
        {isManager ? (
          <RequestActionsPanel
            request={request}
            status={status}
            onStatusChange={setStatus}
            response={adminResponse}
            onResponseChange={setAdminResponse}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onExport={handleExport}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD text-sm text-center text-muted-foregroundL dark:text-muted-foregroundD">
            نتیجه درخواست در انتهای  صفحه ای درخواست  بعد از بررسی توسط ادمین ثبت میشود
          </div>
        )}


      </aside>
    </div>
  );
};

export default RequestDetailPage;