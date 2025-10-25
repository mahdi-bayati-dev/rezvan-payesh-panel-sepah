import { useState } from 'react'; // ۱. ایمپورت useState
import { LogOut, AlertTriangle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hook/reduxHooks';
import { logoutUser, selectUser } from '@/store/slices/authSlice';
import { Spinner } from '@/components/ui/Spinner';

import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

export const UserProfile = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const logoutStatus = useAppSelector((state) => state.auth.logoutStatus);

    // ۳. استیت برای کنترل باز/بسته بودن مدال
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // ۴. تابع جدید برای تایید خروج (که به مدال پاس داده می‌شود)
    const confirmLogout = () => {
        dispatch(logoutUser());
        setIsLogoutModalOpen(false); // بستن مدال بعد از تایید
    };

    // ۵. تابع باز کردن مدال (که به دکمه اصلی متصل می‌شود)
    const openLogoutModal = () => {
        setIsLogoutModalOpen(true);
    };

    // ۶. تابع بستن مدال (که به مدال پاس داده می‌شود)
    const closeLogoutModal = () => {
        setIsLogoutModalOpen(false);
    };


    if (!user) {
        return null;
    }

    return (
        <> {/* ۷. استفاده از Fragment چون دو المان داریم (بخش پروفایل + مدال) */}
            <div className="border-t border-borderL dark:border-borderD">
                <div className="flex items-center justify-between gap-2 p-4 hover:bg-secondaryL/50 dark:hover:bg-secondaryD/50">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <img
                            alt={`پروفایل ${user.user_name}`}
                            src="/img/avatars/2.png" // Placeholder
                            className="size-10 rounded-full object-cover flex-shrink-0"
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
                    {/* ۸. دکمه خروج حالا مدال را باز می‌کند */}
                    <button
                        onClick={openLogoutModal} // <-- اتصال به تابع باز کردن مدال
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

            {/* ۹. رندر کردن کامپوننت مدال "خنگ" با پراپ‌های لازم */}
            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={closeLogoutModal}
                onConfirm={confirmLogout}
                title="تایید خروج"
                message="آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟"
                confirmText="خروج"
                cancelText="انصراف"
                variant="warning" // یا 'danger'
                // آیکون سفارشی (اختیاری)
                icon={<AlertTriangle className="h-6 w-6 text-yellow-500" aria-hidden="true" />}
            />
        </>
    );
};

