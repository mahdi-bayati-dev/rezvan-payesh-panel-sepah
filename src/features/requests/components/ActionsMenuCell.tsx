import { EllipsisVertical, Pencil, Trash2, Eye } from 'lucide-react';
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
} from '@/components/ui/Dropdown';

interface ActionsMenuCellProps {
    requestId: string;
}

const ActionsMenuCell = ({ requestId }: ActionsMenuCellProps) => {
    const handleEdit = () => console.log('Edit', requestId);
    const handleView = () => console.log('View', requestId);
    const handleDelete = () => console.log('Delete', requestId);

    return (
        <Dropdown>
            <DropdownTrigger>
                <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryL dark:focus:ring-offset-backgroundD">
                    <EllipsisVertical className="w-5 h-5" />
                </button>
            </DropdownTrigger>
            <DropdownContent>
                <DropdownItem onClick={handleView} icon={<Eye size={16} />}>
                    مشاهده
                </DropdownItem>
                <DropdownItem onClick={handleEdit} icon={<Pencil size={16} />}>
                    ویرایش
                </DropdownItem>
                <DropdownItem
                    onClick={handleDelete}
                    className="text-red-600 dark:text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/40"
                    icon={<Trash2 size={16} />}
                >
                    حذف
                </DropdownItem>
            </DropdownContent>
        </Dropdown>
    );
};

export default ActionsMenuCell;

