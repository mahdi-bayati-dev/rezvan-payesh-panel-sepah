import type { Requester } from "@/features/requests/types";
import { RequesterDetailAvatar } from "./RequesterDetailAvatar";

// یک کامپوننت کوچک داخلی برای نمایش ردیف‌های اطلاعات
const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col gap-1 justify-between text-sm">
        <div className="border-b border-borderL dark:border-borderD">
            <span className="text-muted-foregroundL dark:text-muted-foregroundD ">{label}</span>

        </div>
        <div className="mx-auto ">
            <span className="font-bold text-foregroundL dark:text-foregroundD">{value}</span>

        </div>
    </div>
);

interface RequesterInfoCardProps {
    requester: Requester;
}

export const RequesterInfoCard = ({ requester }: RequesterInfoCardProps) => {
    return (
        <div className=" dark:bg-backgroundD border-l border-borderL dark:border-borderD pl-2">
            <h3 className="text-lg font-bold text-right mb-6 dark:text-backgroundL-500">مشخصات</h3>
            <div className="flex flex-col gap-y-4">
                <RequesterDetailAvatar
                    name={requester.name}
                    avatarUrl={requester.avatarUrl}
                />
                {/* <InfoRow label="نام و نام خانوادگی" value={requester.name} /> */}
                <InfoRow label="کد پرسنلی" value={requester.phone} />
                <InfoRow label="سازمان" value="بخش ۱" /> {/* (از داده‌های فیک) */}
                <InfoRow label="گروه کاری" value="کارمند" /> {/* (از داده‌های فیک) */}
            </div>
        </div>
    );
};