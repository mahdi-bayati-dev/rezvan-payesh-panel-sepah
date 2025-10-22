import { useState } from "react";
import { Plus, Save, X } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import GroupRow from "../components/TableSettingsPage/GroupRow";



const TableSettingsPage = () => {
    const navigate = useNavigate()
    // فیک
    const [groups, setGroups] = useState([
        { id: '1', name: 'پیش‌فرض' },
        { id: '2', name: 'مرخصی' },
        { id: '3', name: 'ماموریت' },
        { id: '4', name: 'اضافه کاری' },
    ]);

    // (توابع Handler برای دکمه‌ها - فعلاً فقط لاگ می‌گیرند)
    const handleAddGroup = () => {
        const newGroup = { id: String(groups.length + 1), name: 'گروه جدید' };
        setGroups([...groups, newGroup]);
    };
    const handleEditGroup = (id: string) => {
        const updatedGroups = groups.map(group =>
            group.id === id ? { ...group, name: 'نام ویرایش شده' } : group
        );
        setGroups(updatedGroups);
    };
    const handleDeleteGroup = (id: string) => {
        const filteredGroups = groups.filter(group => group.id !== id);
        setGroups(filteredGroups);
    };
    const handleSaveChanges = () => {
        console.log("ذخیره تنظیمات...");
        alert("تنظیمات ذخیره شد (شبیه‌سازی)");
        // navigate('/requests'); // بازگشت به لیست
    };
    const handleCancel = () => {
        navigate('/requests'); // بازگشت به لیست
    };
    return (
        <div className="p-6 bg-backgroundL-500 dark:bg-backgroundD rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-borderL dark:border-borderD">
                <h2 className="text-xl font-bold text-right dark:text-backgroundL-500">
                    تنظیمات
                </h2>
                {/* دکمه‌های ذخیره و لغو در بالا سمت چپ */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSaveChanges}
                        className="flex items-center gap-1 bg-primaryL text-primary-foregroundL dark:bg-primaryD dark:text-primary-foregroundD px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-successD-foreground cursor-pointer"
                    >
                        <Save size={16} />
                        تایید
                    </button>
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-1 bg-backgroundL-500 text-foregroundL dark:bg-backgroundD dark:text-foregroundD px-4 py-1.5 rounded-lg text-sm font-medium border border-borderL dark:border-borderD hover:bg-destructiveL hover:text-backgroundL-500 cursor-pointer"
                    >
                        <X size={16} />
                        لغو
                    </button>
                </div>
            </div>

            {/* چیدمان دو ستونه */}
            <div className="flex flex-col md:flex-row-reverse gap-6">

                {/* ستون راست: گروه‌ها */}
                <div className="w-full md:w-1/3 lg:w-1/4 p-4 border border-borderL dark:border-borderD rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-right">گروه ها</h3>
                        <button onClick={handleAddGroup} className="text-primaryL dark:text-primaryD hover:opacity-80">
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="flex flex-col">
                        {groups.map(group => (
                            <GroupRow
                                key={group.id}
                                name={group.name}
                                onEdit={() => handleEditGroup(group.id)}
                                onDelete={() => handleDeleteGroup(group.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* ستون چپ: تنظیمات اصلی */}
                <div className="flex-1 p-4 border border-borderL dark:border-borderD rounded-lg">
                    <h3 className="font-bold text-right mb-4">تنظیمات اصلی</h3>
                    {/* TODO: بخش تنظیمات اصلی (دسته بندی و زیرمجموعه) را اینجا پیاده‌سازی کنید */}
                    <p className="text-sm text-center text-muted-foregroundL dark:text-muted-foregroundD py-10">
                        (بخش دسته‌بندی و زیرمجموعه در آینده اضافه می‌شود)
                    </p>
                </div>
            </div>
        </div>
    )
}

export default TableSettingsPage