/* reports/routes/reportPageDetails.tsx */
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, AlertTriangle, CalendarClock } from "lucide-react";

import { useLogDetails } from "@/features/reports/hooks/hook";
import { useUser } from "@/features/User/hooks/hook";

import { EmployeeInfoCard } from "@/features/reports/components/reportPageDetails/EmployeeInfoCard";
import { LogInfoCard } from "@/features/reports/components/reportPageDetails/LogInfoCard";
import { toPersianNumbers } from "../utils/toPersianNumbers";

const ReportDetailHeader = ({ id, date, onBack }: { id: string; date: string; onBack: () => void }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-borderL dark:border-borderD gap-4">
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="p-2.5 rounded-full bg-secondaryL/50 hover:bg-secondaryL dark:bg-secondaryD/30 dark:hover:bg-secondaryD text-muted-foregroundL dark:text-muted-foregroundD transition-all active:scale-95"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
      <div>
        <h2 className="text-xl font-bold text-foregroundL dark:text-foregroundD">جزئیات گزارش</h2>
        <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-1">مشاهده کامل اطلاعات ثبت شده</p>
      </div>
    </div>

    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-backgroundL dark:bg-zinc-900 border border-borderL dark:border-zinc-800">
      <CalendarClock size={16} className="text-primaryL dark:text-primaryD" />
      <span className="text-sm text-muted-foregroundL">تاریخ:</span>
      <span className="text-sm font-bold">{date}</span>
      <span className="mx-2 text-borderL dark:text-zinc-700">|</span>
      <span className="text-sm text-muted-foregroundL">شناسه:</span>
      <span className="text-sm font-bold">{toPersianNumbers(id)}</span>
    </div>
  </div>
);

function ReportPageDetails() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { data: log, isLoading: isLoadingLog, isError: isErrorLog } = useLogDetails(reportId);

  // ✅ رفع خطای TS2345: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.
  // استفاده از nullish coalescing (??) برای پاس دادن یک مقدار عددی (مثل 0) به هوکuseUser.
  // این کار باعث رضایت تایپ‌اسکریپت می‌شود. از آنجا که این کوئری "وابسته" (Dependent Query) است،
  // هوک داخلی باید با شرط !!userId اجرا شود تا با مقدار 0 درخواستی ارسال نکند.
  const { data: fullProfile, isLoading: isLoadingUser } = useUser(log?.employee.userId ?? 0);

  if (isLoadingLog || (log && isLoadingUser)) return <div className="p-10 flex flex-col items-center"><Loader2 className="animate-spin" /></div>;
  if (isErrorLog || !log) return <div className="p-6"><AlertTriangle /> گزارش یافت نشد.</div>;

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6">

        {/* چیدمان یکسان با جزئیات درخواست */}
        <main className="flex-1 p-6 rounded-3xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD shadow-sm">
          <ReportDetailHeader id={log.id} date={log.date} onBack={() => navigate("/reports")} />
          <div className="flex flex-col lg:flex-row gap-8 pt-8">
            <aside className="w-full lg:w-80 flex-shrink-0">
              <EmployeeInfoCard logEmployee={log.employee} userEmployee={fullProfile?.employee} />
            </aside>
            <section className="flex-1 min-w-0">
              <LogInfoCard logData={log} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ReportPageDetails;