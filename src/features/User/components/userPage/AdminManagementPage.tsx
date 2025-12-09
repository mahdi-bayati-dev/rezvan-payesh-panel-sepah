import React, { useState, Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { AdminListTable } from '@/features/User/components/userList/AdminListTable';
import Input from '@/components/ui/Input';
import { Search, Users } from 'lucide-react';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    React.useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const adminTabs = [
    { id: 'l2', label: 'ادمین‌های L2', role: 'org-admin-l2' },
    { id: 'l3', label: 'ادمین‌های L3', role: 'org-admin-l3' },
    { id: 'user', label: 'کاربران عادی', role: 'user' },
];

function AdminManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    return (
        <div className="p-4 md:p-8 space-y-6" dir="rtl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold dark:text-borderL flex items-center gap-2">
                        <Users className="h-7 w-7" />
                        مدیریت کاربران و ادمین‌ها
                    </h1>
                    <p className="text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                        لیست کاربران سیستم بر اساس سطح دسترسی (نقش).
                    </p>
                </div>
            </div>

            <div className="w-full">
                <Tab.Group>
                    <Tab.List className="flex flex-wrap justify-between gap-2 bg-secondaryL/20 dark:bg-secondaryD/20 p-2 rounded-xl border border-borderL dark:border-borderD mb-6">
                        <div className='flex gap-2'>
                            {adminTabs.map((tab) => (
                                <Tab key={tab.id} as={Fragment}>
                                    {({ selected }) => (
                                        <button
                                            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${selected
                                                ? 'bg-backgroundL-500 border border-borderL text-primaryL shadow-sm dark:bg-backgroundD dark:border-primaryD dark:text-primaryD'
                                                : 'text-muted-foregroundL hover:bg-white/50 dark:text-muted-foregroundD dark:hover:bg-white/10'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    )}
                                </Tab>
                            ))}
                        </div>

                        <div className="relative w-full max-w-sm">
                            <Input label='' placeholder="جستجو در نام، ایمیل، کد پرسنلی..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" />
                            <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL dark:text-muted-foregroundD" />
                        </div>
                    </Tab.List>

                    <Tab.Panels>
                        {adminTabs.map((tab) => (
                            <Tab.Panel key={tab.id}>
                                <AdminListTable role={tab.role} globalSearch={debouncedSearch} />
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
}

export default AdminManagementPage;