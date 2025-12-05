import { MoreVertical, Eye, User, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type ActivityLog } from '../../types/index';
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
} from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';

type ActivityLogActionsProps = {
    log: ActivityLog;
    onEdit: (log: ActivityLog) => void;
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

    // ✅ اصلاح مهم: تبدیل اجباری به Boolean
    // اگر از API عدد 0 بیاید، در JSX به عنوان متن "0" رندر می‌شود.
    // با !! آن را به false واقعی تبدیل می‌کنیم تا چیزی نمایش ندهد.
    const isApproved = !!log.is_allowed;

    // بررسی وجود مغایرت (تاخیر یا تعجیل)
    const hasException = log.lateness_minutes > 0 || log.early_departure_minutes > 0;

    // دکمه تایید سریع فقط زمانی نمایش داده می‌شود که:
    // ۱. هنوز تایید نشده باشد (!isApproved)
    // ۲. حتماً دارای مغایرت باشد (hasException)
    const showQuickApproveButton = !isApproved && hasException;

    return (
        <div className="flex items-center justify-end gap-2">

            {/* دکمه تایید سریع (فقط برای موارد دارای مغایرت) */}
            {showQuickApproveButton && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApprove}
                    className="hidden md:flex items-center gap-1.5 h-8 px-3 transition-all duration-200
                               border-primaryL text-primaryL hover:bg-primaryL hover:text-successD-foreground
                               dark:border-primaryD dark:text-primaryD dark:hover:bg-primaryD dark:hover:text-black shadow-sm"
                    title="تایید و مجاز کردن "
                >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">تایید</span>
                </Button>
            )}

            {/* نمایش آیکون تایید شده (فقط بصری) */}
            {/* اینجا چون isApproved حالا بولین واقعی است، اگر false باشد هیچی رندر نمیشود */}
            {isApproved && (
                <div className="hidden md:flex items-center gap-1 h-8 px-2 text-emerald-600/60 dark:text-emerald-400/60 select-none cursor-default" title="تایید شده">
                    <ShieldCheck className="w-4 h-4" />
                </div>
            )}

            {/* منوی عملیات */}
            <Dropdown>
                <DropdownTrigger>
                    <button
                        type="button"
                        className="p-2 rounded-md hover:bg-secondaryL dark:hover:bg-secondaryD
                                 text-muted-foregroundL dark:text-muted-foregroundD transition-colors active:scale-95"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </DropdownTrigger>

                <DropdownContent className="w-48">
                    <DropdownItem onClick={handleViewDetails} icon={<Eye className="w-4 h-4" />}>
                        مشاهده جزئیات
                    </DropdownItem>

                    <DropdownItem
                        onClick={handleViewEmployeeReport}
                        icon={<User className="w-4 h-4" />}
                    >
                        گزارش‌های {log.employee.name}
                    </DropdownItem>

                    {/* گزینه تایید در منو */}
                    {!isApproved && (
                        <>
                            <div className="h-px bg-borderL dark:bg-borderD my-1 opacity-50" />
                            <DropdownItem
                                onClick={handleApprove}
                                className="text-successL dark:text-successD focus:bg-successL/10 dark:focus:bg-successD/10 font-medium"
                                icon={<CheckCircle2 className="w-4 h-4" />}
                            >
                                {hasException ? 'تایید و موجه کردن' : 'تایید نهایی'}
                            </DropdownItem>
                        </>
                    )}
                </DropdownContent>
            </Dropdown>
        </div>
    );
};