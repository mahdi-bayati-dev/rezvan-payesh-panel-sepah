import React from 'react';
import { type User } from '@/features/User/types/index';
// ✅ ایمپورت کامپوننت‌های جدید
import { UserInfoCard, type InfoRowData } from '@/components/ui/UserInfoCard';

// ✅ تابع کمکی (Helper) برای ساختن Placeholder آواتار (مثلا: علی رضایی -> "ع ر")
const getAvatarPlaceholder = (firstName?: string, lastName?: string): string => {
    const fName = firstName || '';
    const lName = lastName || '';
    // اولین حرف نام و اولین حرف نام خانوادگی
    return `${fName.charAt(0)}${lName.charAt(0)}`.trim() || '??';
};

// ✅ تابع کمکی برای تبدیل تاریخ (که قبلاً هم داشتیم)
const getPersianYear = (dateString: string | null | undefined): string => {
    if (!dateString) return '---';
    try {
        return new Date(dateString).toLocaleDateString('fa-IR-u-nu-latn', { year: 'numeric' });
    } catch (e) {
        console.error("Invalid date for getPersianYear:", dateString, e);
        return '---';
    }
};

/**
 * سایدبار پروفایل (کامپوننت "هوشمند" که داده‌ها را مپ می‌کند)
 */
const UserProfileSidebar: React.FC<{ user: User }> = ({ user }) => {
    const { employee } = user;

    // --- ۱. آماده‌سازی داده‌ها برای کامپوننت گنگ ---

    const displayName = employee ? `${employee.first_name} ${employee.last_name}`.trim() : user.user_name;

    const avatarPlaceholder = getAvatarPlaceholder(employee?.first_name, employee?.last_name);

    // ✅ ساخت آرایه Data-Driven بر اساس تایپ InfoRowData
    const infoRows: InfoRowData[] = [
        {
            label: "کد پرسنلی",
            value: employee?.personnel_code || '---'
        },
        {
            label: "سازمان",
            value: employee?.organization?.name || '---'
        },
        {
            // ✅✅✅ اصلاحیه کلیدی (هماهنگ با آپدیت types) ✅✅✅
            // به جای 'work_group_id'، ما 'work_group.name' را می‌خوانیم
            label: "گروه کاری",
            value: employee?.work_group?.name || '---'
        },
        {
            label: "سال ورود",
            value: getPersianYear(employee?.starting_job)
        }
    ];

    // --- ۲. رندر کردن کامپوننت گنگ ---
    return (
        // (استایل‌های قبلی شما برای border و ... حفظ شده است)
        <div className="p-6 rounded-r-lg  bg-backgroundL-500 dark:bg-backgroundD sticky top-8">

            <UserInfoCard
                title="مشخصات کاربری" // (عنوان بالای کارت)
                name={displayName}
                avatarPlaceholder={avatarPlaceholder}
                // avatarUrl={user.employee?.avatar_url} // (اگر URL آواتار داشتید)
                infoRows={infoRows}
            />

        </div>
    );
};

export default UserProfileSidebar;