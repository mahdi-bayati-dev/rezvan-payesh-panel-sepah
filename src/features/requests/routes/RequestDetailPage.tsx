// features/requests/routes/RequestDetailPage.tsx

import { useMemo, useState } from 'react'; // ایمپورت useState
import { useParams, useNavigate } from 'react-router-dom'; // ایمپورت useNavigate (برای دکمه لغو)
import { MOCK_REQUESTS } from '@/features/requests/data/mockData';
import { RequesterInfoCard } from '@/features/requests/components/requestDetails/RequesterInfoCard';
import { RequestInfoCard } from '@/features/requests/components/requestDetails/RequestInfoCard';
import { RequestActionsPanel } from '@/features/requests/components/requestDetails/RequestActionsPanel';
import type { SelectOption } from '@/components/ui/SelectBox'; // ایمپورت تایپ SelectOption

// کامپوننت هدر صفحه (بهبود استایل برای تراز بهتر)
const RequestDetailHeader = ({ number, date }: { number: string; date: string }) => (
  // از flex justify-between استفاده می‌کنیم تا شماره و تاریخ به سمت چپ بروند
  <div className="flex justify-between items-center pb-4 border-b border-borderL dark:border-borderD">
    <h2 className="text-xl font-bold text-right text-foregroundL dark:text-foregroundD">
      مشاهده درخواست
    </h2>
    {/* شماره و تاریخ درخواست در سمت چپ */}
    <div className="flex gap-4 text-sm text-muted-foregroundL dark:text-muted-foregroundD">
      <span>{`#${number}`}</span>
      <span>{date}</span>
    </div>
  </div>
);

// داده‌های فیک Status (برای محاسبه مقدار اولیه state)
const mockStatuses: SelectOption[] = [
  { id: 'stat1', name: 'تایید شده' },
  { id: 'stat2', name: 'رد شده' },
  { id: 'stat3', name: 'در حال بررسی' },
];

const RequestDetailPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate(); // هوک برای بازگشت

  // پیدا کردن درخواست بر اساس ID
  const request = useMemo(
    () => MOCK_REQUESTS.find((r) => r.id === requestId),
    [requestId]
  );

  // --- تعریف State ها در کامپوننت والد ---
  const [status, setStatus] = useState<SelectOption | null>(
    () => mockStatuses.find(s => s.name === request?.status) || null
  );
  const [adminResponse, setAdminResponse] = useState(''); // State برای Textarea
  const [isSubmitting, setIsSubmitting] = useState(false); // State برای دکمه‌ها

  // مدیریت حالت "یافت نشد"
  if (!request) {
    return (
      <div className="p-6 font-bold text-2xl text-center text-destructiveL dark:text-destructiveD">
        درخواستی با این شناسه یافت نشد.
      </div>
    );
  }

  // --- تعریف توابع مدیریت‌کننده (Handler Functions) ---
  const handleConfirm = async () => {
    setIsSubmitting(true);
    console.log("درحال ارسال داده‌ها به API:");
    console.log({
      requestId: request.id, // ID درخواست برای API
      newStatus: status?.name,
      response: adminResponse,
    });
    
    // شبیه‌سازی تماس API
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    setIsSubmitting(false);
    alert("تغییرات با موفقیت ثبت شد (شبیه‌سازی)");
    // (می‌توانید به صفحه لیست برگردید یا داده‌ها را رفرش کنید)
    // navigate('/requests'); 
  };

  const handleCancel = () => {
    console.log("عملیات لغو یا رد شد.");
    // بازگشت به صفحه لیست درخواست‌ها
    navigate('/requests'); 
  };

  const handleExport = () => {
    console.log("در حال آماده‌سازی خروجی برای درخواست:", request.id);
    alert("خروجی PDF آماده شد (شبیه‌سازی)");
  };

  return (
    // چیدمان اصلی صفحه: دو ستون سایدبار و محتوا
    <div className="flex flex-col-reverse md:flex-row gap-6 p-4">

      {/* کارت اصلی محتوا */}
      <main className="flex-1 flex flex-col gap-6 p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">

        {/* هدر داخل کارت */}
        <RequestDetailHeader number={request.requestNumber} date={request.date} />

        {/* بخش اطلاعات (مشخصات و جزئیات) */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ستون مشخصات */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <RequesterInfoCard requester={request.requester} />
          </div>
          {/* ستون جزئیات */}
          <div className="flex-1">
            <RequestInfoCard request={request} />
          </div>
        </div>
      </main>

      {/* سایدبار (گزینه‌ها) */}
      <aside className="w-full md:w-72 lg:w-80">
        {/* پاس دادن تمام Props به کامپوننت کنترل‌شده */}
        <RequestActionsPanel
          request={request}
          status={status}
          onStatusChange={setStatus}
          response={adminResponse}
          onResponseChange={setAdminResponse}
          onConfirm={handleConfirm}
          onCancel={handleCancel} // تابع لغو/بازگشت
          onExport={handleExport}
          isSubmitting={isSubmitting}
        />
      </aside>
    </div>
  );
};

export default RequestDetailPage;