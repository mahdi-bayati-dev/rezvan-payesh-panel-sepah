import React, { Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { type User } from '@/features/User/types/index';

// --- ایمپورت Redux برای بررسی نقش کاربر فعلی ---
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';

// --- ایمپورت فرم‌های تفکیک‌شده ---
// ✅ اصلاح: استفاده از alias به جای مسیر نسبی
import AccountInfoForm from '@/features/User/components/userPage/formUser/AccountInfoForm';
import PersonalDetailsForm from '@/features/User/components/userPage/formUser/PersonalDetailsForm';
import OrganizationalForm from '@/features/User/components/userPage/formUser/OrganizationalForm';
import ContactForm from '@/features/User/components/userPage/formUser/ContactForm';
// ✅ ایمپورت فرم جدید
import AccessManagementForm from '@/features/User/components/userCreate/AccessManagementForm';
import { ShieldAlert } from 'lucide-react';

/**
 * مدیریت تب‌ها با Headless UI
 */
const ProfileTabs: React.FC<{ user: User }> = ({ user }) => {

    // --- بررسی دسترسی کاربر لاگین کرده ---
    const currentUser = useAppSelector(selectUser);
    const isSuperAdmin = currentUser?.roles?.includes('super_admin') ?? false;

    // ✅ اصلاح: تعریف کامل تب‌ها
    const baseTabs = [
        { id: 'personal', label: 'مشخصات فردی', component: <PersonalDetailsForm user={user} />, icon: null },
        { id: 'organizational', label: 'سازمانی', component: <OrganizationalForm user={user} />, icon: null },
        { id: 'contact', label: 'اطلاعات تماس', component: <ContactForm user={user} />, icon: null },
        { id: 'account', label: 'اطلاعات حساب', component: <AccountInfoForm user={user} />, icon: null },
    ];

    // ✅ تب مدیریت دسترسی (فقط برای Super Admin)
    const accessTab = {
        id: 'access',
        label: 'مدیریت دسترسی',
        component: <AccessManagementForm user={user} />,
        icon: <ShieldAlert className="h-4 w-4" /> // آیکون فقط برای این تب
    };

    // اگر کاربر Super Admin باشد، تب دسترسی را اضافه کن
    const tabs = isSuperAdmin ? [...baseTabs, accessTab] : baseTabs;


    return (
        <div className="w-full">
            <Tab.Group>
                {/* هدر تب‌ها */}
                <Tab.List className="flex flex-wrap justify-start gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                    {tabs.map((tab) => (
                        <Tab key={tab.id} as={Fragment}>
                            {({ selected }) => (
                                <button
                                    className={`flex items-center px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${selected
                                        ? 'bg-backgroundL-500 border border-borderL text-borderD border-primary shadow-sm'
                                        : ' dark:bg-gray-900  dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {/* ✅ اصلاح: رندر کردن آیکون (فقط اگر وجود داشته باشد) */}
                                    {tab.icon && <span className="ml-2">{tab.icon}</span>}
                                    {tab.label}
                                </button>
                            )}
                        </Tab>
                    ))}
                </Tab.List>


                {/* محتوای تب‌ها */}
                <Tab.Panels>
                    {tabs.map((tab) => (
                        <Tab.Panel key={tab.id}>
                            {tab.component}
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

export default ProfileTabs;