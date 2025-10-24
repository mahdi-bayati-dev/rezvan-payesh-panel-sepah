// src/features/reports/components/employeeReportPage/EmployeeReportHeader.tsx

import { ArrowRight } from 'lucide-react';

interface EmployeeReportHeaderProps {
    employeeName: string;
    onBack: () => void;
}

export const EmployeeReportHeader = ({
    employeeName,
    onBack,
}: EmployeeReportHeaderProps) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-borderL dark:border-borderD gap-4">
        <h2 className="text-xl font-bold text-right text-foregroundL dark:text-foregroundD">
            گزارش فعالیت‌های: {employeeName}
        </h2>
        <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-primaryL dark:text-primaryD hover:bg-primaryL/10 dark:hover:bg-primaryD/10 px-3 py-1 rounded-md transition-colors"
        >
            <ArrowRight className="w-4 h-4" />
            بازگشت
        </button>
    </div>
);