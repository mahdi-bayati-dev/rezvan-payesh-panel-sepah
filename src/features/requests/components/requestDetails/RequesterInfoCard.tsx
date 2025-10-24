// src/features/requests/components/.../RequesterInfoCard.tsx (نام فایل را حفظ می‌کنیم)

import type { Requester } from "@/features/requests/types";
// ایمپورت کامپوننت عمومی از پوشه ui
import { UserInfoCard, type InfoRowData } from "@/components/ui/UserInfoCard";

interface RequesterInfoCardProps {
    requester: Requester;
}


export const RequesterInfoCard = ({ requester }: RequesterInfoCardProps) => {

    // ۱. داده‌ی Requester را به فرمت مورد نیاز UserInfoCard تبدیل می‌کنیم
    const infoRows: InfoRowData[] = [
        { label: "کد پرسنلی", value: requester.phone }, // استفاده از phone
        { label: "سازمان", value: "بخش ۱" }, // (اینجا همچنان فیک است)
        { label: "گروه کاری", value: "کارمند" }, // (اینجا همچنان فیک است)
    ];

    // ۲. رندر کامپوننت عمومی با داده‌های آماده شده
    return (
        <UserInfoCard
            title="مشخصات درخواست‌دهنده"
            name={requester.name}
            avatarUrl={requester.avatarUrl}
            // می‌توانید از نام فرد برای placeholder استفاده کنید
            avatarPlaceholder={requester.name.substring(0, 2)}
            infoRows={infoRows}
        />
    );
};