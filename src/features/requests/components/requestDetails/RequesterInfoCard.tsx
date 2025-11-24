// features/requests/components/requestDetails/RequesterInfoCard.tsx

import type { LeaveRequest } from "@/features/requests/types";
import { UserInfoCard, type InfoRowData } from "@/components/ui/UserInfoCard";
// ✅ ۱. ایمپورت تابع کمکی برای ساخت آدرس کامل عکس
import { getFullImageUrl } from "@/features/User/utils/imageHelper";

interface RequesterInfoCardProps {
    request: LeaveRequest;
}

export const RequesterInfoCard = ({ request }: RequesterInfoCardProps) => {

    const { employee } = request;

    const infoRows: InfoRowData[] = [
        {
            label: "کد پرسنلی",
            value: employee.personnel_code || '---'
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
            value: employee.phone_number || '---'
        },
    ];

    const fullName = `${employee.first_name} ${employee.last_name}`;
    const avatarPlaceholder = `${employee.first_name.substring(0, 1)}${employee.last_name.substring(0, 1)}`.trim() || '??';

    // ✅ ۲. استخراج آدرس تصویر از آرایه تصاویر (اولین عکس)
    const rawAvatarPath = employee.images && employee.images.length > 0 ? employee.images[0].url : null;
    
    // ✅ ۳. تبدیل مسیر خام به آدرس کامل با استفاده از تابع کمکی
    const fullAvatarUrl = getFullImageUrl(rawAvatarPath) || undefined;

    return (
        <UserInfoCard
            title="مشخصات درخواست‌دهنده"
            name={fullName}
            // ✅ ۴. پاس دادن آدرس صحیح به کامپوننت
            avatarUrl={fullAvatarUrl}
            avatarPlaceholder={avatarPlaceholder}
            infoRows={infoRows}
        />
    );
};