import { DetailAvatar } from './DetailAvatar';

export type InfoRowData = {
    label: string;
    value: string | number;
};

const InfoRow = ({ label, value }: InfoRowData) => (
    <div className="flex flex-col gap-1 justify-between text-sm">
        <div className="border-b border-borderL dark:border-borderD pb-1">
            <span className="text-muted-foregroundL dark:text-muted-foregroundD">{label}</span>
        </div>
        <div className="mx-auto pt-1">
            <span className="font-bold text-foregroundL dark:text-foregroundD">{value}</span>
        </div>
    </div>
);

interface UserInfoCardProps {
    title: string;
    name: string;
    avatarUrl?: string;
    avatarPlaceholder?: string;
    infoRows: InfoRowData[];
}

export const UserInfoCard = ({
    title,
    name,
    avatarUrl,
    avatarPlaceholder,
    infoRows,
}: UserInfoCardProps) => {
    return (
        <div className="dark:bg-backgroundD border-l-1 border-primaryL dark:border-primaryD pl-4 py-2">
            {/* اصلاح رنگ متن در دارک مود: قبلا dark:text-backgroundL-500 بود که اشتباه است */}
            <h3 className="text-lg font-bold text-right mb-6 text-foregroundL dark:text-foregroundD flex items-center gap-2">
                {title}
            </h3>
            
            <div className="flex flex-col gap-y-6">
                {/* بخش آواتار */}
                <DetailAvatar
                    name={name}
                    avatarUrl={avatarUrl}
                    placeholderText={avatarPlaceholder}
                />

                {/* بخش اطلاعات */}
                <div className='grid grid-cols-1 gap-4 pt-4 border-t border-borderL dark:border-borderD'>
                    {infoRows.map((row) => (
                        <InfoRow key={row.label} label={row.label} value={row.value} />
                    ))}
                </div>
            </div>
        </div>
    );
};