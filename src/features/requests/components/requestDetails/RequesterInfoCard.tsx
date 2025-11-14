// features/requests/components/requestDetails/RequesterInfoCard.tsx

// ۱. تایپ LeaveRequest را از index ماژول requests ایمپورت می‌کنیم
import type { LeaveRequest } from "@/features/requests/types";
// (اطمینان از مسیر صحیح UserInfoCard)
import { UserInfoCard, type InfoRowData } from "@/components/ui/UserInfoCard";

interface RequesterInfoCardProps {
    // این کامپوننت کل آبجکت LeaveRequest را می‌پذیرد
    request: LeaveRequest;
}

export const RequesterInfoCard = ({ request }: RequesterInfoCardProps) => {

    // ۲. داده‌ی Employee را از آبجکت request استخراج می‌کنیم
    const { employee } = request;

    // ۳. [بروزرسانی] داده‌ی Employee را به فرمت مورد نیاز UserInfoCard تبدیل می‌کنیم
    //    (با استفاده از فیلدهای جدیدی که JSON تایید کرد)
    const infoRows: InfoRowData[] = [
        {
            label: "کد پرسنلی",
            // حالا به personnel_code دسترسی داریم
            value: employee.personnel_code || '---'
        },
        {
            label: "سازمان",
            // حالا به organization.name دسترسی داریم
            value: employee.organization?.name || '---'
        },
        {
            label: "سمت",
            // حالا به position دسترسی داریم
            value: employee.position || '---'
        },
        {
            label: "شماره تماس",
            // حالا به phone_number دسترسی داریم
            value: employee.phone_number || '---'
        },
    ];

    // ۴. [بروزرسانی] نام کامل و Placeholder آواتار
    const fullName = `${employee.first_name} ${employee.last_name}`;
    const avatarPlaceholder = `${employee.first_name.substring(0, 1)}${employee.last_name.substring(0, 1)}`.trim() || '??';

    return (
        <UserInfoCard
            title="مشخصات درخواست‌دهنده"
            name={fullName}
            // avatarUrl={employee.avatarUrl} // (این فیلد در API شما نیست)
            avatarPlaceholder={avatarPlaceholder}
            infoRows={infoRows}
        />
    );
};