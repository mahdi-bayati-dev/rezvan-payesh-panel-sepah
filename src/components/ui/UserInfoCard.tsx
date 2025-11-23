import { DetailAvatar } from './DetailAvatar'; // ✅ ایمپورت کامپوننت عمومی جدید


// تعریف تایپ برای هر ردیف اطلاعاتی
export type InfoRowData = {
    label: string;
    value: string | number;
};

// کامپوننت کوچک داخلی (بدون تغییر)
const InfoRow = ({ label, value }: InfoRowData) => (
    <div className="flex flex-col gap-1 justify-between text-sm">
        <div className="border-b border-borderL dark:border-borderD">
            <span className="text-muted-foregroundL dark:text-muted-foregroundD ">{label}</span>
        </div>
        <div className="mx-auto ">
            <span className="font-bold text-foregroundL dark:text-foregroundD">{value}</span>
        </div>
    </div>
);

interface UserInfoCardProps {
    /** عنوانی که بالای کارت نمایش داده می‌شود */
    title: string;
    /** نام کامل شخص برای آواتار */
    name: string;
    /** URL آواتار (اختیاری) */
    avatarUrl?: string;
    /** متن placeholder آواتار (اختیاری) */
    avatarPlaceholder?: string;
    /** آرایه‌ای از ردیف‌های اطلاعاتی که باید نمایش داده شوند
      * این الگو کامپوننت را کاملاً data-driven و قابل استفاده مجدد می‌کند
      */
    infoRows: InfoRowData[];
}

/**
 * کامپوننت ماژولار "گنگ" برای نمایش کارت اطلاعات یک شخص (کاربر، کارمند، درخواست‌دهنده)
 */
export const UserInfoCard = ({
    title,
    name,
    avatarUrl,
    avatarPlaceholder,
    infoRows,
}: UserInfoCardProps) => {
    return (
        <div className=" dark:bg-backgroundD border-l border-borderL dark:border-borderD pl-2">
            <h3 className="text-lg font-bold text-right mb-6 dark:text-backgroundL-500">
                {title}
            </h3>
            <div className="flex flex-col gap-y-4">
                {/* ۱. استفاده از کامپوننت آواتار عمومی */}
                <DetailAvatar
                    name={name}
                    avatarUrl={avatarUrl}
                    placeholderText={avatarPlaceholder}
                />


                <div className='grid grid-cols-2 gap-4 pt-4 border-t border-borderL dark:border-borderD'>
                    {infoRows.map((row) => (
                        <InfoRow key={row.label} label={row.label} value={row.value} />
                    ))}
                </div>
            </div>
        </div>
    );
};