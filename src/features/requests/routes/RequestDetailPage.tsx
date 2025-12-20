// features/requests/routes/RequestDetailPage.tsx
import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns-jalali';
import { toast } from 'react-toastify';
import { ShieldAlert, ArrowRight, CalendarClock, Hash } from 'lucide-react';

import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';
import { type User } from '@/features/requests/types';

import { useLeaveRequestById, useProcessLeaveRequest } from '@/features/requests/hook/useLeaveRequests';
import { RequesterInfoCard } from '@/features/requests/components/requestDetails/RequesterInfoCard';
import { RequestInfoCard } from '@/features/requests/components/requestDetails/RequestInfoCard';
import { RequestActionsPanel } from '@/features/requests/components/requestDetails/RequestActionsPanel';

import type { SelectOption } from '@/components/ui/SelectBox';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { toPersianNumbers } from '@/features/requests/components/mainRequests/RequestsColumnDefs';

const RequestDetailHeader = ({ number, date, onBack }: { number: string; date: string; onBack: () => void }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-borderL dark:border-borderD">
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="p-2.5 rounded-full bg-secondaryL/50 hover:bg-secondaryL dark:bg-secondaryD/30 dark:hover:bg-secondaryD text-muted-foregroundL dark:text-muted-foregroundD transition-all active:scale-95"
      >
        <ArrowRight size={20} />
      </button>
      <div>
        <h2 className="text-xl font-bold text-foregroundL dark:text-foregroundD">جزئیات درخواست</h2>
        <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-1">اطلاعات کامل و وضعیت درخواست</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-3 text-sm">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-backgroundL dark:bg-zinc-900 border border-borderL dark:border-zinc-800">
        <Hash size={16} className="text-primaryL dark:text-primaryD" />
        <span className="text-muted-foregroundL">شماره:</span>
        <span className="font-bold">{toPersianNumbers(number)}</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-backgroundL dark:bg-zinc-900 border border-borderL dark:border-zinc-800">
        <CalendarClock size={16} className="text-primaryL dark:text-primaryD" />
        <span className="text-muted-foregroundL">تاریخ ثبت:</span>
        <span className="font-bold">{toPersianNumbers(date)}</span>
      </div>
    </div>
  </div>
);

const RequestDetailPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const numericRequestId = Number(requestId);
  const currentUser = useAppSelector(selectUser) as User | null;

  const isManager = useMemo(() => {
    if (!currentUser?.roles) return false;
    return currentUser.roles.some(r => ['super_admin', 'org-admin-l2', 'org-admin-l3'].includes(r));
  }, [currentUser]);

  const { data: requestData, isLoading, isError, error } = useLeaveRequestById(numericRequestId);
  const request = useMemo(() => requestData?.data, [requestData]);
  const isOwnRequest = useMemo(() => currentUser?.employee?.id === request?.employee?.id, [currentUser, request]);

  const processMutation = useProcessLeaveRequest();
  const [status, setStatus] = useState<SelectOption | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useMemo(() => {
    if (request) {
      const opts = [{ id: 'approved', name: 'تایید شده' }, { id: 'rejected', name: 'رد شده' }, { id: 'pending', name: 'در حال بررسی' }];
      setStatus(opts.find(s => s.id === request.status) || null);
      setAdminResponse(request.rejection_reason || '');
    }
  }, [request]);

  const handleConfirm = () => {
    if (!request || !status) return toast.error("وضعیت را مشخص کنید.");
    if (status.id === 'rejected' && !adminResponse.trim()) return setValidationError("دلیل رد الزامی است.");
    processMutation.mutate({ id: request.id, payload: { status: status.id as any, rejection_reason: adminResponse.trim() || undefined } });
  };

  if (isLoading) return <div className="flex justify-center items-center h-[50vh]"><Spinner size="lg" /></div>;
  if (isError || !request) return <Alert variant="destructive" className="m-4"><AlertTitle>خطا</AlertTitle><AlertDescription>{(error as any)?.message || "یافت نشد"}</AlertDescription></Alert>;

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row-reverse gap-6">

        {/* بخش سمت راست (سایدبار عملیات) */}
        <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-6 lg:self-start space-y-6">
          {isManager ? (
            isOwnRequest ? (
              <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-center shadow-sm">
                <ShieldAlert className="w-14 h-14 mx-auto text-amber-500 mb-4 opacity-80" />
                <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-2">تضاد منافع</h3>
                <p className="text-sm text-amber-700/80 leading-relaxed">امکان بررسی درخواست خودتان وجود ندارد.</p>
              </div>
            ) : (
              <RequestActionsPanel
                request={request} status={status} onStatusChange={setStatus}
                response={adminResponse} onResponseChange={setAdminResponse}
                onConfirm={handleConfirm} onCancel={() => navigate('/requests')}
                onExport={() => { }} isSubmitting={processMutation.isPending}
                errorMessage={validationError}
              />
            )
          ) : (
            <div className="p-6 rounded-3xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD text-sm text-center text-muted-foregroundL shadow-sm">
              <p>نتیجه بررسی در انتهای فرم نمایش داده می‌شود.</p>
            </div>
          )}
        </aside>

        {/* محتوای اصلی */}
        <main className="flex-1 flex flex-col gap-6 p-6 rounded-3xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD shadow-sm">
          <RequestDetailHeader
            number={String(request.id)}
            date={format(parseISO(request.created_at), 'yyyy/MM/dd')}
            onBack={() => navigate('/requests')}
          />
          <div className="flex flex-col xl:flex-row gap-8 pt-2">
            <div className="w-full xl:w-80 flex-shrink-0"><RequesterInfoCard request={request} /></div>
            <div className="flex-1 min-w-0"><RequestInfoCard request={request} /></div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestDetailPage;