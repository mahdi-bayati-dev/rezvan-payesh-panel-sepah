import { useState } from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hook/reduxHooks';
import { logoutUser, selectUser } from '@/store/slices/authSlice';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Avatar } from '@/components/ui/Avatar';
import { getFullImageUrl } from '@/features/User/utils/imageHelper';
// ✅ ایمپورت هوک برای دریافت اطلاعات کامل کاربر (شامل تصاویر)
import { useUser } from '@/features/User/hooks/hook';

export const UserProfile = () => {
    const dispatch = useAppDispatch();

    // ۱. دریافت اطلاعات پایه از ریداکس (مطمئنیم که ID و Auth وجود دارد)
    const userFromRedux = useAppSelector(selectUser);

    // ۲. فچ کردن اطلاعات کامل کاربر از سرور
    // نکته معماری: ریداکس معمولاً دیتای سبک (/me) را نگه می‌دارد.
    // برای نمایش آواتار که نیاز به ریلیشن images دارد، بهتر است دیتای تازه را بگیریم.
    const { data: fullUser } = useUser(userFromRedux?.id || 0);

    // ۳. ادغام هوشمند: اگر دیتای کامل رسید از آن استفاده کن، وگرنه همان دیتای ریداکس
    const user = fullUser || userFromRedux;

    const logoutStatus = useAppSelector((state) => state.auth.logoutStatus);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const confirmLogout = () => {
        dispatch(logoutUser());
        setIsLogoutModalOpen(false);
    };

    if (!user) {
        return null;
    }

    // --- لاجیک دریافت تصویر ---
    const employeeImages = user.employee?.images;
    const rawImageAddress = employeeImages?.[0]?.url || employeeImages?.[0]?.path;
    const profileImage = getFullImageUrl(rawImageAddress);

    return (
        <>
            <div className="border-t border-borderL dark:border-borderD">
                <div className="flex items-center justify-between gap-2 p-4 hover:bg-secondaryL/50 dark:hover:bg-secondaryD/50">
                    <div className="flex items-center gap-2 overflow-hidden">

                        <Avatar
                            src={profileImage}
                            alt={`پروفایل ${user.user_name}`}
                            className="size-10 rounded-full object-cover flex-shrink-0 border border-borderL dark:border-borderD"
                            fallbackSrc="/img/avatars/default.png"
                        />
                        <div className="min-w-0">
                            <p className="text-xs truncate">
                                <strong className="block font-medium text-foregroundL dark:text-foregroundD truncate">
                                    {user.user_name}
                                </strong>
                                <span className="text-muted-foregroundL dark:text-muted-foregroundD truncate">
                                    {user.email}
                                </span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="text-muted-foregroundL hover:bg-destructiveL cursor-pointer hover:scale-105 transition-colors hover:text-backgroundL-500 rounded-2xl dark:text-muted-foregroundD dark:hover:text-destructiveD flex-shrink-0 p-1"
                        title="خروج"
                        disabled={logoutStatus === 'loading'}
                    >
                        {logoutStatus === 'loading' ? (
                            <Spinner size="sm" />
                        ) : (
                            <LogOut size={20} className='' />
                        )}
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={confirmLogout}
                title="تایید خروج"
                message="آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟"
                confirmText="خروج"
                cancelText="انصراف"
                variant="warning"
                icon={<AlertTriangle className="h-6 w-6 text-yellow-500" aria-hidden="true" />}
            />
        </>
    );
};