import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, AlertTriangle } from "lucide-react";

import { useLogDetails } from "@/features/reports/hooks/hook";
import { useUser } from "@/features/User/hooks/hook";

import { EmployeeInfoCard } from "@/features/reports/components/reportPageDetails/EmployeeInfoCard";
import { LogInfoCard } from "@/features/reports/components/reportPageDetails/LogInfoCard";

// --- کامپوننت‌های وضعیت (Header, LoadingCard, NotFoundCard ... بدون تغییر) ---
const ReportDetailHeader = ({
  id,
  date,
  onBack,
}: {
  id: string;
  date: string;
  onBack: () => void;
}) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-borderL dark:border-borderD gap-4">
    <h2 className="text-xl font-bold text-right text-foregroundL dark:text-foregroundD">
      جزئیات گزارش فعالیت (ادمین)
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
const LoadingCard = () => (
  <div className="flex flex-col items-center justify-center p-10 min-h-[300px]">
    <Loader2 className="w-10 h-10 text-primaryL dark:text-primaryD animate-spin" />
    <p className="mt-4 text-lg text-muted-foregroundL dark:text-muted-foregroundD">
      در حال بارگذاری جزئیات...
    </p>
  </div>
);
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
// --- ---

function ReportPageDetails() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  const {
    data: log,
    isLoading: isLoadingLog,
    isError: isErrorLog,
  } = useLogDetails(reportId);

  // userId رو از لاگ مپ شده می‌گیریم
  const employeeUserId = log?.employee.userId;

  const {
    data: fullEmployeeProfile, // این آبجکت User کامل است
    isLoading: isLoadingUser,
  } = useUser(employeeUserId!);


  const handleGoBack = () => {
    navigate("/reports");
  };

  if (isLoadingLog || (log && isLoadingUser)) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
          <LoadingCard />
        </main>
      </div>
    );
  }

  if (isErrorLog || !log) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <NotFoundCard message="گزارش مورد نظر یافت نشد." />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <main className="p-6 rounded-2xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD">
        <ReportDetailHeader id={log.id} date={log.date} onBack={handleGoBack} />

        <div className="flex flex-col md:flex-row gap-6 pt-6">
          <aside className="w-full md:w-72 lg:w-80 flex-shrink-0">

            {/* --- [اصلاح کلیدی] --- */}
            {/* ما به کارت، آبجکت ناقص employee از خود لاگ (برای نام و کد پرسنلی) 
              و آبجکت کامل employee از useUser (برای سازمان و گروه کاری) رو پاس می‌دیم.
            */}
            <EmployeeInfoCard
              logEmployee={log.employee}
              userEmployee={fullEmployeeProfile?.employee} // <-- اینجا فقط .employee پاس داده می‌شود
            />
            {/* --- [پایان اصلاح] --- */}

          </aside>

          <section className="flex-1">
            <LogInfoCard logData={log} />
          </section>
        </div>
      </main>
    </div>
  );
}

export default ReportPageDetails;