
import React, { useState, Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { AdminListTable } from '@/features/User/components/userList/AdminListTable'; // ✅ ایمپورت جدول
import Input from '@/components/ui/Input';
import { Search, Users } from 'lucide-react';

// (هوک Debounce)
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


// --- تعریف تب‌ها ---
const adminTabs = [
    { id: 'l2', label: 'ادمین‌های L2', role: 'org-admin-l2' },
    { id: 'l3', label: 'ادمین‌های L3', role: 'org-admin-l3' },
    { id: 'user', label: 'کاربران عادی', role: 'user' },
];

/**
 * صفحه اصلی مدیریت ادمین‌ها (مسیر /admin-management)
 */
function AdminManagementPage() {

    // --- State برای جستجوی سراسری ---
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    return (
        <div className="p-4 md:p-8 space-y-6" dir="rtl">
            {/* هدر صفحه */}
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



            {/* مدیریت تب‌ها */}
            <div className="w-full">
                <Tab.Group>
                    {/* هدر تب‌ها */}
                    <Tab.List className="flex flex-wrap justify-between gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                        <div className='flex gap-2'>
                            {adminTabs.map((tab) => (
                                <Tab key={tab.id} as={Fragment}>
                                    {({ selected }) => (
                                        <button
                                            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${selected
                                                ? 'bg-backgroundL-500 border border-borderL text-borderD border-primary shadow-sm'
                                                : ' dark:bg-gray-900  dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    )}
                                </Tab>
                            ))}
                        </div>

                        {/* نوار ابزار: جستجو */}
                        <div className="relative w-full max-w-sm">
                            <Input
                                label=''
                                placeholder="جستجو در نام، ایمیل، کد پرسنلی..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10"
                            />
                            <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL" />
                        </div>
                    </Tab.List>

                    {/* محتوای تب‌ها */}
                    <Tab.Panels>
                        {adminTabs.map((tab) => (
                            <Tab.Panel key={tab.id}>
                                {/* هر تب، کامپوننت جدول را با نقش مربوطه و 
                                  مقدار جستجوی سراسری رندر می‌کند.
                                */}
                                <AdminListTable
                                    role={tab.role}
                                    globalSearch={debouncedSearch}
                                />
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
}

export default AdminManagementPage;