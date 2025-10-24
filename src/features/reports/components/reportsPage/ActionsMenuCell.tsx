// src/features/reports/components/ActivityLogActions.tsx

import { MoreVertical, Eye, User } from 'lucide-react'; // آیکون‌ها را متناسب تغییر دادم
import { useNavigate } from 'react-router-dom';
import { type ActivityLog } from '@/features/reports/types/index';
// ایمپورت کامپوننت‌های ماژولار UI
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
} from '@/components/ui/Dropdown';

// تعریف پراپس‌های کامپوننت
type ActivityLogActionsProps = {
    /**
     * آبجکت داده‌ی کامل این ردیف
     * ما به 'id' لاگ و 'employee.id' برای ناوبری نیاز داریم
     */
    log: ActivityLog;
};

/**
 * کامپوننت ماژولار "هوشمند" برای نمایش منوی عملیات
 * این کامپوننت منطق ناوبری را درون خود مدیریت می‌کند.
 */
export const ActionsMenuCell = ({ log }: ActivityLogActionsProps) => {
    // ۱. استفاده مستقیم از هوک ناوبری
    const navigate = useNavigate();

    // ۲. تعریف توابع هندلر در داخل خود کامپوننت
    const handleViewDetails = () => {
        // مسیر را بر اساس ساختار روتینگ خودتان تنظیم کنید
        navigate(`/reports/${log.id}`);
    };

    const handleViewEmployeeReport = () => {

        navigate(`/reports/employee/${log.employee.employeeId}`);
    };

    return (
        <div className="text-left">
            <Dropdown>
                <DropdownTrigger>
                    <button
                        type="button"
                        className="p-2 rounded-md hover:bg-secondaryL dark:hover:bg-secondaryD
                       text-muted-foregroundL dark:text-muted-foregroundD transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </DropdownTrigger>
                <DropdownContent>
                    {/* ۳. اتصال مستقیم توابع به آیتم‌های منو */}
                    <DropdownItem onClick={handleViewDetails} icon={<Eye className="w-4 h-4" />}>
                        مشاهده
                    </DropdownItem>
                    <DropdownItem
                        onClick={handleViewEmployeeReport}
                        icon={<User className="w-4 h-4" />}
                    >
                        گزارش فردی
                    </DropdownItem>
                </DropdownContent>
            </Dropdown>
        </div>
    );
};