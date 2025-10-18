// features/requests/components/ActionsMenuCell.tsx
import { EllipsisVertical } from 'lucide-react';

// ۱. وارد کردن کامپوننت‌های عمومی Dropdown از لایه UI
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
} from '@/components/ui/Dropdown';
// آیکون سه نقطه (همان که قبلاً داشتیم)
const DotsIcon = () => (
    <EllipsisVertical />
);


interface ActionsMenuCellProps {
    requestId: string;
}

const ActionsMenuCell = ({ requestId }: ActionsMenuCellProps) => {
    // توابع ما هیچ تغییری نکرده‌اند
    const handleEdit = () => console.log('Edit', requestId);
    const handleDelete = () => console.log('Delete', requestId);



    return (
        // ۲. استفاده از کامپوننت‌های ماژولار
        <Dropdown>
            {/* این دکمه‌ای است که کاربر می‌بیند */}
            <DropdownTrigger>
                <button className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300">
                    <DotsIcon />
                </button>
            </DropdownTrigger>

            {/* این محتوایی است که باز می‌شود */}
            <DropdownContent>
                <DropdownItem onClick={handleEdit}>
                    ویرایش
                </DropdownItem>
                <DropdownItem
                    onClick={handleDelete}
                    className=" hover:bg-red-50" // به راحتی کلاس سفارشی می‌دهیم
                >
                    مشاهده
                </DropdownItem>
                <DropdownItem
                    onClick={handleDelete}
                    className="text-red-600 hover:bg-red-50" // به راحتی کلاس سفارشی می‌دهیم
                >
                    حذف
                </DropdownItem>

            </DropdownContent>
        </Dropdown>
    );
};

export default ActionsMenuCell;