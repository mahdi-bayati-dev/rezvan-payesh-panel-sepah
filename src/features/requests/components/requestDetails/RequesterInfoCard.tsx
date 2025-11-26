// features/requests/components/requestDetails/RequesterInfoCard.tsx

import type { LeaveRequest } from "@/features/requests/types";
import { UserInfoCard, type InfoRowData } from "@/components/ui/UserInfoCard";
import { getFullImageUrl } from "@/features/User/utils/imageHelper";
// ✅ ایمپورت تابع تبدیل اعداد
import { toPersianNumbers } from "@/features/requests/components/mainRequests/RequestsColumnDefs";

interface RequesterInfoCardProps {
    request: LeaveRequest;
}

export const RequesterInfoCard = ({ request }: RequesterInfoCardProps) => {

    const { employee } = request;

    const infoRows: InfoRowData[] = [
        {
            label: "کد پرسنلی",
            // ✅ تبدیل کد پرسنلی به فارسی
            value: toPersianNumbers(employee.personnel_code) || '---'
        },
        {
            label: "سازمان",
            value: employee.organization?.name || '---'
        },
        {
            label: "سمت",
            value: employee.position || '---'
        },
        {
            label: "شماره تماس",
            // ✅ تبدیل شماره تماس به فارسی
            value: toPersianNumbers(employee.phone_number) || '---'
        },
    ];

    const fullName = `${employee.first_name} ${employee.last_name}`;
    const avatarPlaceholder = `${employee.first_name.substring(0, 1)}${employee.last_name.substring(0, 1)}`.trim() || '??';
    const rawAvatarPath = employee.images && employee.images.length > 0 ? employee.images[0].url : null;
    const fullAvatarUrl = getFullImageUrl(rawAvatarPath) || undefined;

    return (
        <UserInfoCard
            title="مشخصات درخواست‌دهنده"
            name={fullName}
            avatarUrl={fullAvatarUrl}
            avatarPlaceholder={avatarPlaceholder}
            infoRows={infoRows}
            // می‌توانید کلاس‌های اضافه برای استایل‌دهی بهتر پاس بدهید
            // className="h-full border border-borderL dark:border-borderD shadow-sm"
        />
    );
};