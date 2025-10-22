import { Edit, Trash2, } from 'lucide-react';
type GroupRowProps = {
    onEdit: () => void;
    onDelete: () => void;
    name: string;
};

const GroupRow = ({ onEdit, onDelete, name }: GroupRowProps) => {
    return (
        <div className="flex items-center justify-between p-3 border-b border-borderL dark:border-borderD last:border-b-0 hover:bg-secondaryL dark:hover:bg-secondaryD">
            <span className="text-sm font-medium text-foregroundL dark:text-foregroundD">{name}</span>
            <div className="flex gap-2">
                <button onClick={onEdit} className="text-blue-600 hover:text-blue-800">
                    <Edit size={16} />
                </button>
                <button onClick={onDelete} className="text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};
export default GroupRow