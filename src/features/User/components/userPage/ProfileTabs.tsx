import React, { Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { type User } from '@/features/User/types/index';

// --- ایمپورت فرم‌های تفکیک‌شده ---
import AccountInfoForm from './formUser/AccountInfoForm';
import PersonalDetailsForm from './formUser/PersonalDetailsForm';
import OrganizationalForm from './formUser/OrganizationalForm';
import ContactForm from './formUser/ContactForm';

/**
 * مدیریت تب‌ها با Headless UI
 */
const ProfileTabs: React.FC<{ user: User }> = ({ user }) => {

    const tabs = [
        { id: 'personal', label: 'مشخصات فردی' },
        { id: 'organizational', label: 'سازمانی' },
        { id: 'contact', label: 'اطلاعات تماس' },
        { id: 'account', label: 'اطلاعات حساب' },
    ];

    return (
        <div className="w-full">
            <Tab.Group>
                {/* هدر تب‌ها */}
                <Tab.List className="flex flex-wrap justify-start gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                    {tabs.map((tab) => (
                        <Tab key={tab.id} as={Fragment}>
                            {({ selected }) => (
                                <button
                                    className={`px-5 py-2 text-sm font-medium rounded-lg  transition-all duration-200 cursor-pointer ${selected
                                        ? 'bg-backgroundL-500 border border-borderL text-borderD border-primary shadow-sm'
                                        : ' dark:bg-gray-900  dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            )}
                        </Tab>
                    ))}
                </Tab.List>


                {/* محتوای تب‌ها */}
                <Tab.Panels>
                    <Tab.Panel>
                        <PersonalDetailsForm user={user} />
                    </Tab.Panel>
                    <Tab.Panel>
                        <OrganizationalForm user={user} />
                    </Tab.Panel>
                    <Tab.Panel>
                        <ContactForm user={user} />
                    </Tab.Panel>
                    <Tab.Panel>
                        <AccountInfoForm user={user} />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

export default ProfileTabs;
