import { MoreVertical, Eye, User, Pencil, Check } from 'lucide-react'; // ۱. آیکون‌های جدید
import { useNavigate } from 'react-router-dom';
import { type ActivityLog } from '@/features/reports/types/index';
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
} from '@/components/ui/Dropdown';

// ۲. تعریف پراپ‌های جدید برای Edit و Approve
type ActivityLogActionsProps = {
    log: ActivityLog;
    // ۳. هندلرهای جهش (Mutation) از والد می‌آیند
    onEdit: (log: ActivityLog) => void;
    onApprove: (log: ActivityLog) => void;
};

export const ActionsMenuCell = ({ log, onEdit, onApprove }: ActivityLogActionsProps) => {
    const navigate = useNavigate();

    // توابع ناوبری (بدون تغییر)
    const handleViewDetails = () => {
        navigate(`/reports/${log.id}`);
    };

    const handleViewEmployeeReport = () => {
        // ۴. ❗️ اطمینان از ارسال شناسه صحیح
        // ما از employee.id (عددی) استفاده می‌کنیم، چون employeeId (رشته‌ای) در API نبود
        navigate(`/reports/employee/${log.employee.id}`);
    };

    // ۵. توابع اتصال‌دهنده به پراپ‌های جدید
    const handleEdit = () => {
        onEdit(log); // (این تابع باید مودال ویرایش را باز کند)
    };

    const handleApprove = () => {
        // [اصلاح] window.confirm حذف شد
        // مدیریت تأیید به والد (reportPage.tsx) سپرده می‌شود
        onApprove(log);
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
                    {/* آیتم‌های ناوبری (بدون تغییر) */}
                    <DropdownItem onClick={handleViewDetails} icon={<Eye className="w-4 h-4" />}>
                        مشاهده جزئیات
                    </DropdownItem>
                    <DropdownItem
                        onClick={handleViewEmployeeReport}
                        icon={<User className="w-4 h-4" />}
                    >
                        گزارش فردی
                    </DropdownItem>

                    {/* --- ۶. آیتم‌های جدید بر اساس API --- */}
                    <DropdownItem onClick={handleEdit} icon={<Pencil className="w-4 h-4" />}>
                        ویرایش
                    </DropdownItem>

                    {/* ۷. رندر مشروط دکمه "تأیید"
                      فقط لاگ‌هایی که 'is_allowed' false دارند قابل تأیید هستند
                    */}
                    {!log.is_allowed && (
                        <DropdownItem
                            onClick={handleApprove}
                            icon={<Check className="w-4 h-4 text-successL dark:text-successD" />}
                            className="text-successL dark:text-successD" // استایل ویژه
                        >
                            تأیید تردد
                        </DropdownItem>
                    )}

                </DropdownContent>
            </Dropdown>
        </div>
    );
};