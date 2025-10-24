// src/features/reports/components/details/EmployeeInfoCard.tsx (نام پیشنهادی)

import type { ActivityLog } from "@/features/reports/types"; // تایپ مخصوص گزارش
// ایمپورت کامپوننت عمومی از پوشه ui
import { UserInfoCard, type InfoRowData } from "@/components/ui/UserInfoCard";

// ما به جای کل log، فقط آبجکت employee را می‌گیریم
interface EmployeeInfoCardProps {
    employee: ActivityLog['employee'];
}

export const EmployeeInfoCard = ({ employee }: EmployeeInfoCardProps) => {

    // ۱. داده‌ی Employee را به فرمت مورد نیاز UserInfoCard تبدیل می‌کنیم
    const infoRows: InfoRowData[] = [
        { label: "کد پرسنلی", value: employee.employeeId }, // استفاده از employeeId
        { label: "سازمان", value: "بخش ۱" }, // (اینجا همچنان فیک است)
        { label: "گروه کاری", value: "کارمند" }, // (اینجا همچنان فیک است)

    ];

    // ۲. رندر همان کامپوننت عمومی با داده‌های متفاوت
    return (
        <UserInfoCard
            title="مشخصات کارمند"
            name={employee.name}
            avatarUrl={employee.avatarUrl}
            avatarPlaceholder={employee.name.substring(0, 2)}
            infoRows={infoRows}
        />
    );
};