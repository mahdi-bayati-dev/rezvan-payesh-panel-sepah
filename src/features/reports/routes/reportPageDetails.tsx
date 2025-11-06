import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, AlertTriangle } from 'lucide-react'; // ۱. ایمپورت آیکون‌های وضعیت

// ۲. ایمپورت هوک واقعی به جای داده‌های فیک
import { useLogDetails } from '../hooks/hook';

// ۳. ایمپورت کامپوننت‌های UI
import { EmployeeInfoCard } from '@/features/reports/components/reportPageDetails/EmployeeInfoCard';
import { LogInfoCard } from '@/features/reports/components/reportPageDetails/LogInfoCard';

// --- کامپوننت‌های وضعیت ---

const ReportDetailHeader = ({ id, date, onBack }: { id: string; date: string; onBack: () => void }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-borderL dark:border-borderD gap-4">
    <h2 className="text-xl font-bold text-right text-foregroundL dark:text-foregroundD">
      جزئیات گزارش فعالیت
    </h2>
    <div className="flex items-center gap-4">
      <div className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">
        <span className="ml-2">{`#${id}`}</span>
        <span>{date}</span>
      </div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-primaryL dark:text-primaryD hover:bg-primaryL/10 dark:hover:bg-primaryD/10 px-3 py-1 rounded-md transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت
      </button>
    </div>
  </div>
);

// کامپوننت لودینگ
const LoadingCard = () => (
  <div className="flex flex-col items-center justify-center p-10 min-h-[300px]">
    <Loader2 className="w-10 h-10 text-primaryL dark:text-primaryD animate-spin" />
    <p className="mt-4 text-lg text-muted-foregroundL dark:text-muted-foregroundD">
      در حال بارگذاری جزئیات...
    </p>
  </div>
);

// کامپوننت خطا
const NotFoundCard = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center p-10 min-h-[300px] bg-backgroundL-500 dark:bg-backgroundD rounded-2xl border border-destructiveL dark:border-destructiveD">
    <AlertTriangle className="w-12 h-12 text-destructiveL dark:text-destructiveD" />
    <h3 className="mt-4 text-xl font-bold text-destructiveL dark:text-destructiveD">
      خطا
    </h3>
    <p className="mt-2 text-base text-muted-foregroundL dark:text-muted-foregroundD">
      {message}
    </p>
  </div>
);

// --- کامپوننت اصلی صفحه ---

function ReportPageDetails() {
  // ۴. reportId از URL گرفته می‌شود (مثلاً "150")
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  // ۵. [تغییر کلیدی] حذف useMemo و mockData، جایگزینی با هوک useLogDetails
  const {
    data: log, // داده‌ی مپ شده و آماده (ActivityLog)
    isLoading, // وضعیت لودینگ
    isError,   // وضعیت خطا (مثلاً 404 واقعی از API)
  } = useLogDetails(reportId); // هوک با reportId فراخوانی می‌شود

  const handleGoBack = () => {
    navigate('/reports'); // بازگشت به لیست
  };

  // ۶. مدیریت وضعیت لودینگ
  if (isLoading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
          <LoadingCard />
        </main>
      </div>
    );
  }

  // ۷. مدیریت وضعیت خطا (شامل 404 واقعی از API)
  if (isError || !log) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <NotFoundCard message="گزارش مورد نظر یافت نشد یا در دسترسی به آن مشکلی رخ داده است." />
      </div>
    );
  }

  // ۸. رندر در صورت موفقیت (داده 'log' اکنون واقعی است)
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">

        {/* هدر اطلاعات واقعی را نمایش می‌دهد */}
        <ReportDetailHeader id={log.id} date={log.date} onBack={handleGoBack} />

        <div className="flex flex-col md:flex-row gap-6 pt-6">
          {/* سایدبار (مشخصات کارمند) */}
          <aside className="w-full md:w-72 lg:w-80 flex-shrink-0">
            {/* کامپوننت‌ها دیتای واقعی را می‌گیرند */}
            <EmployeeInfoCard employee={log.employee} />
          </aside>

          {/* ستون اصلی (جزئیات لاگ) */}
          <section className="flex-1">
            <LogInfoCard logData={log} />
          </section>
        </div>
      </main>
    </div>
  );
}

export default ReportPageDetails;