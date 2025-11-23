import React from 'react';
import { type User } from '@/features/User/types/index';
import { UserInfoCard, type InfoRowData } from '@/components/ui/UserInfoCard';
import { formatDateToPersian } from '@/features/User/utils/dateHelper';
import { getFullImageUrl } from '@/features/User/utils/imageHelper'; // ✅ ایمپورت هلپر جدید

// تابع کمکی برای ساخت حروف اختصاری آواتار
const getAvatarPlaceholder = (firstName?: string, lastName?: string): string => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return (f + l) || 'U';
};

const UserProfileSidebar: React.FC<{ user: User }> = ({ user }) => {
    const { employee } = user;

    const displayName = (employee?.first_name || employee?.last_name)
        ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim()
        : user.user_name;

    const avatarPlaceholder = getAvatarPlaceholder(employee?.first_name, employee?.last_name);

    // ✅ اصلاح: استفاده از تابع کمکی برای ساخت URL کامل
    const rawPath = employee?.images && employee.images.length > 0 
        ? employee.images[0].path 
        : undefined;
        
    const profileImageUrl = getFullImageUrl(rawPath);

    const infoRows: InfoRowData[] = [
        { label: "کد پرسنلی", value: employee?.personnel_code || '---' },
        { label: "سازمان", value: employee?.organization?.name || '---' },
        { label: "گروه کاری", value: employee?.work_group?.name || '---' },
        { label: "شروع همکاری", value: formatDateToPersian(employee?.starting_job, 'long') },
        { label: "تاریخ ثبت‌نام", value: formatDateToPersian(user.created_at, 'short') }
    ];

    return (
        <div className="p-6 rounded-lg border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD sticky top-8 shadow-sm">
            <UserInfoCard
                title="مشخصات کاربری"
                name={displayName}
                avatarPlaceholder={avatarPlaceholder}
                avatarUrl={profileImageUrl}
                infoRows={infoRows}
            />

            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {user.roles?.map(role => (
                    <span key={role} className="px-2 py-1 text-xs font-medium rounded-full bg-primaryL/10 text-primaryL border border-primaryL/20">
                        {role === 'super_admin' ? 'مدیر کل' :
                            role === 'org-admin-l2' ? 'ادمین سازمان (L2)' :
                                role === 'org-admin-l3' ? 'ادمین واحد (L3)' : 'کارمند'}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default UserProfileSidebar;