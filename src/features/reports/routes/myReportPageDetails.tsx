import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, AlertTriangle, CalendarClock } from "lucide-react";

import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";

import { useMyLogDetails } from "../hooks/hook";

import { EmployeeInfoCard } from "@/features/reports/components/reportPageDetails/EmployeeInfoCard";
import { LogInfoCard } from "@/features/reports/components/reportPageDetails/LogInfoCard";
import { toPersianNumbers } from "../utils/toPersianNumbers";

const ReportDetailHeader = ({
    id,
    date,
    onBack,
}: {
    id: string;
    date: string;
    onBack: () => void;
}) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-borderL dark:border-borderD gap-4">
        <div className="flex items-center gap-3">
            <button
                onClick={onBack}
                className="p-2.5 rounded-full bg-secondaryL/50 hover:bg-secondaryL dark:bg-secondaryD/30 dark:hover:bg-secondaryD text-muted-foregroundL dark:text-muted-foregroundD transition-all active:scale-95"
                title="بازگشت"
            >
                <ArrowRight className="w-5 h-5" />
            </button>
            <div>
                <h2 className="text-xl font-bold text-foregroundL dark:text-foregroundD">
                    جزئیات فعالیت من
                </h2>
                <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                    اطلاعات ثبت شده برای این فعالیت
                </p>
            </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-backgroundL dark:bg-zinc-900 border border-borderL dark:border-zinc-800">
            <CalendarClock size={16} className="text-primaryL dark:text-primaryD" />
            <span className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">تاریخ:</span>
            <span className="text-sm font-bold text-foregroundL dark:text-foregroundD">{date}</span>
            <span className="mx-2 text-borderL dark:text-zinc-700">|</span>
            <span className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">شناسه:</span>
            <span className="text-sm  font-bold text-foregroundL dark:text-foregroundD">{toPersianNumbers(id)}</span>
        </div>
    </div>
);

const LoadingCard = () => (
    <div className="flex flex-col items-center justify-center p-10 min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primaryL dark:text-primaryD animate-spin" />
        <p className="mt-4 text-lg text-muted-foregroundL dark:text-muted-foregroundD">
            در حال بارگذاری جزئیات...
        </p>
    </div>
);

const NotFoundCard = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center p-10 min-h-[300px] bg-backgroundL-500 dark:bg-backgroundD rounded-3xl border border-destructiveL dark:border-destructiveD">
        <AlertTriangle className="w-12 h-12 text-destructiveL dark:text-destructiveD opacity-80" />
        <h3 className="mt-4 text-xl font-bold text-destructiveL dark:text-destructiveD">
            خطا
        </h3>
        <p className="mt-2 text-base text-muted-foregroundL dark:text-muted-foregroundD">
            {message}
        </p>
    </div>
);

function MyReportPageDetails() {
    const { reportId } = useParams<{ reportId: string }>();
    const navigate = useNavigate();

    const currentUser = useAppSelector(selectUser);

    const {
        data: log,
        isLoading,
        isError,
    } = useMyLogDetails(reportId);

    const handleGoBack = () => {
        navigate("/reports");
    };

    if (isLoading) {
        return (
            <div className="p-4 max-w-7xl mx-auto">
                <main className="p-6 rounded-3xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD shadow-sm">
                    <LoadingCard />
                </main>
            </div>
        );
    }

    if (isError || !log) {
        return (
            <div className="p-6 max-w-3xl mx-auto">
                <NotFoundCard message="گزارش مورد نظر یافت نشد یا شما دسترسی لازم برای مشاهده آن را ندارید." />
            </div>
        );
    }

    return (
        <div className="p-4  mx-auto">
            <main className="p-6 rounded-3xl bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD shadow-sm">
                <ReportDetailHeader id={log.id} date={log.date} onBack={handleGoBack} />

                <div className="flex flex-col lg:flex-row gap-6 pt-6">
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <EmployeeInfoCard
                            logEmployee={log.employee}
                            userEmployee={currentUser as any}
                        />
                    </aside>

                    <section className="flex-1">
                        <LogInfoCard logData={log} />
                    </section>
                </div>
            </main>
        </div>
    );
}

export default MyReportPageDetails;