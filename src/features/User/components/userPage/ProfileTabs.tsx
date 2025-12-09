import React, { Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { type User } from '@/features/User/types/index';
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';
import AccountInfoForm from '@/features/User/components/userPage/formUser/AccountInfoForm';
import PersonalDetailsForm from '@/features/User/components/userPage/formUser/PersonalDetailsForm';
import OrganizationalForm from '@/features/User/components/userPage/formUser/OrganizationalForm';
import ContactForm from '@/features/User/components/userPage/formUser/ContactForm';
import AccessManagementForm from '@/features/User/components/userCreate/AccessManagementForm';
import { ShieldAlert } from 'lucide-react';

const ProfileTabs: React.FC<{ user: User }> = ({ user }) => {
    const currentUser = useAppSelector(selectUser);
    const isSuperAdmin = currentUser?.roles?.includes('super_admin') ?? false;

    const baseTabs = [
        { id: 'personal', label: 'مشخصات فردی', component: <PersonalDetailsForm user={user} />, icon: null },
        { id: 'organizational', label: 'سازمانی', component: <OrganizationalForm user={user} />, icon: null },
        { id: 'contact', label: 'اطلاعات تماس', component: <ContactForm user={user} />, icon: null },
        { id: 'account', label: 'اطلاعات حساب', component: <AccountInfoForm user={user} />, icon: null },
    ];

    const accessTab = {
        id: 'access',
        label: 'مدیریت دسترسی',
        component: <AccessManagementForm user={user} />,
        icon: <ShieldAlert className="h-4 w-4" />
    };

    const tabs = isSuperAdmin ? [...baseTabs, accessTab] : baseTabs;

    return (
        <div className="w-full">
            <Tab.Group>
                <Tab.List className="flex flex-wrap justify-start gap-2 bg-secondaryL/20 dark:bg-secondaryD/20 p-2 rounded-lg border border-borderL dark:border-borderD shadow-sm mb-6">
                    {tabs.map((tab) => (
                        <Tab key={tab.id} as={Fragment}>
                            {({ selected }) => (
                                <button
                                    className={`flex items-center px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${selected
                                        ? 'bg-backgroundL-500 border border-primaryL text-primaryL shadow-sm dark:bg-backgroundD dark:border-primaryD dark:text-primaryD'
                                        : 'text-muted-foregroundL hover:bg-white/50 dark:text-muted-foregroundD dark:hover:bg-white/10'
                                        }`}
                                >
                                    {tab.icon && <span className="ml-2">{tab.icon}</span>}
                                    {tab.label}
                                </button>
                            )}
                        </Tab>
                    ))}
                </Tab.List>

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