import { MoreVertical, Eye, User, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type ActivityLog } from '../../types/index'; // مسیر نسبی برای اطمینان
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
} from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';

type ActivityLogActionsProps = {
    log: ActivityLog;
    onEdit: (log: ActivityLog) => void; // فعلاً استفاده نمی‌شود اما در اینترفیس هست
    onApprove: (log: ActivityLog) => void;
};

export const ActionsMenuCell = ({ log, onApprove }: ActivityLogActionsProps) => {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        navigate(`/reports/${log.id}`);
    };

    const handleViewEmployeeReport = () => {
        navigate(`/reports/employee/${log.employee.id}`);
    };

    const handleApprove = () => {
        onApprove(log);
    };

    // شرط نمایش دکمه تایید:
    // ۱. اگر کلاً تایید نشده باشد (!is_allowed)
    // ۲. اگر دارای مغایرت (تاخیر یا تعجیل) باشد (حتی اگر قبلاً تایید شده باشد، شاید نیاز به تایید مجدد/موجه کردن باشد)
    const showApproveOption = !log.is_allowed || log.lateness_minutes > 0 || log.early_departure_minutes > 0;

    return (
        <div className="flex items-center justify-end gap-2">

            {/* دکمه تایید سریع (فقط برای رکوردهایی که هنوز تایید اولیه نشده‌اند) */}
            {/* این دکمه بیرون منو می‌ماند تا دسترسی سریع برای ادمین حفظ شود */}
            {!log.is_allowed && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApprove}
                    className="hidden md:flex items-center gap-1 h-8 px-3
                               text-successL border-successL hover:bg-successL/10 hover:text-successL
                               dark:text-successD dark:border-successD dark:hover:bg-successD/10 dark:hover:text-successD"
                    title="تایید سریع"
                >
                    <Check className="w-4 h-4" />
                    <span className="text-xs">تایید</span>
                </Button>
            )}

            {/* منوی عملیات (همیشه نمایش داده می‌شود) */}
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
                    <DropdownItem onClick={handleViewDetails} icon={<Eye className="w-4 h-4" />}>
                        مشاهده جزئیات
                    </DropdownItem>

                    <DropdownItem
                        onClick={handleViewEmployeeReport}
                        icon={<User className="w-4 h-4" />}
                    >
                        گزارش فردی
                    </DropdownItem>

                    {/* ✅ گزینه تایید که به درخواست شما اضافه شد */}
                    {showApproveOption && (
                        <>
                            {/* یک خط جداکننده برای تمیزی */}
                            <div className="h-px bg-borderL dark:bg-borderD my-1 opacity-50" />

                            <DropdownItem
                                onClick={handleApprove}
                                // رنگ سبز برای تمایز
                                className="text-successL dark:text-successD focus:bg-successL/10 dark:focus:bg-successD/10"
                                icon={<Check className="w-4 h-4" />}
                            >
                                {!log.is_allowed ? 'تایید نهایی' : 'موجه کردن مغایرت'}
                            </DropdownItem>
                        </>
                    )}
                </DropdownContent>
            </Dropdown>
        </div>
    );
};