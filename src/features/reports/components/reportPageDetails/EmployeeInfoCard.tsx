import type { ActivityLog } from "@/features/reports/types";
import { UserInfoCard, type InfoRowData } from "@/components/ui/UserInfoCard";

interface EmployeeInfoCardProps {
    employee: ActivityLog['employee'];
}

export const EmployeeInfoCard = ({ employee }: EmployeeInfoCardProps) => {

    // ۱. داده‌ی Employee را به فرمت مورد نیاز UserInfoCard تبدیل می‌کنیم
    const infoRows: InfoRowData[] = [
        // ۲. ❗️ هشدار: API کد پرسنلی (employeeId) را برنگرداند.
        // ما از شناسه عددی (employee.id) استفاده می‌کنیم.
        // برچسب را برای بازتاب این موضوع تغییر می‌دهیم.
        { label: "شناسه کارمند (ID)", value: employee.id.toString() },

        // ۳. ❗️ هشدار: این فیلدها در API وجود ندارند.
        // باید از بک‌اند بخواهید این اطلاعات را به رابطه 'employee' اضافه کند.
        { label: "سازمان", value: "نامشخص" }, // (TODO: Get real data)
        { label: "گروه کاری", value: "نامشخص" }, // (TODO: Get real data)
    ];

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