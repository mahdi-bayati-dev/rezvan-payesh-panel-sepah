import { MoreVertical, Eye, User, Check } from 'lucide-react'; // ۱. آیکون‌ها
import { useNavigate } from 'react-router-dom';
import { type ActivityLog } from '@/features/reports/types/index';
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
} from '@/components/ui/Dropdown';
// [جدید] ایمپورت دکمه
import { Button } from '@/components/ui/Button';

// ۲. پراپ‌ها (بدون تغییر)
type ActivityLogActionsProps = {
    log: ActivityLog;
    onEdit: (log: ActivityLog) => void;
    onApprove: (log: ActivityLog) => void;
};

export const ActionsMenuCell = ({ log, onApprove }: ActivityLogActionsProps) => {
    const navigate = useNavigate();

    // ۳. توابع هندلر (بدون تغییر)
    const handleViewDetails = () => {
        navigate(`/reports/${log.id}`);
    };

    const handleViewEmployeeReport = () => {
        navigate(`/reports/employee/${log.employee.id}`);
    };

    // const handleEdit = () => {
    //     onEdit(log);
    // };

    const handleApprove = () => {
        onApprove(log);
    };

    // --- [اصلاح کلیدی] ۴. منطق UI هوشمند ---

    // اگر لاگ "در انتظار تایید" است، دکمه اصلی تایید را نشان بده
    if (!log.is_allowed) {
        return (
            <div className="text-left">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApprove}
                    // استایل سفارشی برای دکمه تایید (سبز رنگ)
                    className="flex items-center gap-1 text-successL border-successL hover:bg-successL/10 hover:text-successL
                               dark:text-successD dark:border-successD dark:hover:bg-successD/10 dark:hover:text-successD"
                >
                    <Check className="w-4 h-4" />
                    <span>تأیید</span>
                </Button>
            </div>
        );
    }

    // در غیر این صورت (لاگ تایید شده است)، منوی سه‌نقطه را نشان بده
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
                    {/* آیتم‌های ناوبری */}
                    <DropdownItem onClick={handleViewDetails} icon={<Eye className="w-4 h-4" />}>
                        مشاهده جزئیات
                    </DropdownItem>
                    <DropdownItem
                        onClick={handleViewEmployeeReport}
                        icon={<User className="w-4 h-4" />}
                    >
                        گزارش فردی
                    </DropdownItem>



                    {/* دیگر نیازی به آیتم "تایید تردد" در اینجا نیست،
                      چون این منو فقط برای لاگ‌های تایید شده نمایش داده می‌شود.
                    */}

                </DropdownContent>
            </Dropdown>
        </div>
    );
};