// src/features/reports/routes/ReportPageDetails.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { mockActivityLogs } from '../data/mockData';
// ایمپورت کامپوننت‌های ماژولار
import { EmployeeInfoCard } from '@/features/reports/components/reportPageDetails/EmployeeInfoCard';
import { LogInfoCard } from '@/features/reports/components/reportPageDetails/LogInfoCard';

// کامپوننت هدر (بدون تغییر، عالی است)
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

// کامپوننت خطا (بدون تغییر، عالی است)
const NotFoundCard = () => (
  <div className="flex flex-col items-center justify-center p-6 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl border border-destructiveL dark:border-destructiveD">
    {/* ... (محتوای کارت خطا) ... */}
  </div>
);

function ReportPageDetails() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  const log = useMemo(
    () => mockActivityLogs.find((r) => r.id === reportId),
    [reportId]
  );

  const handleGoBack = () => {
    navigate('/reports');
  };

  // بخش مدیریت "یافت نشد" (بدون تغییر)
  if (!log) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <NotFoundCard />
      </div>
    );
  }

  return (
    // استفاده از max-w-7xl برای هماهنگی با RequestDetailPage
    <div className="p-4 max-w-7xl mx-auto">
      <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
        {/* ۱. هدر صفحه در بالا */}
        <ReportDetailHeader id={log.id} date={log.date} onBack={handleGoBack} />


        <div className="flex flex-col md:flex-row gap-6 pt-6">
          {/* سایدبار (مشخصات کارمند) - در دسکتاپ سمت راست */}
          <aside className="w-full md:w-72 lg:w-80 flex-shrink-0">

            <EmployeeInfoCard employee={log.employee} />
          </aside>
          {/* ستون اصلی (جزئیات لاگ) - در دسکتاپ سمت چپ */}
          <section className="flex-1">
            <LogInfoCard logData={log} />
          </section>


        </div>
      </main>
    </div>
  );
}

export default ReportPageDetails;