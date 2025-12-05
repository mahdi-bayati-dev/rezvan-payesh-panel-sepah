import { MoreVertical, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
} from "@/components/ui/Dropdown";
import { type ActivityLog } from "@/features/reports/types/index";

export const MyActionsMenuCell = ({ log }: { log: ActivityLog }) => {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        navigate(`/reports/my/${log.id}`);
    };

    return (
        <div className="text-left">
            <Dropdown>
                <DropdownTrigger>
                    <button
                        type="button"
                        className="p-2 rounded-md hover:bg-secondaryL dark:hover:bg-secondaryD
                         text-muted-foregroundL dark:text-muted-foregroundD transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </DropdownTrigger>
                <DropdownContent>
                    <DropdownItem onClick={handleViewDetails} icon={<Eye className="w-4 h-4" />}>
                        مشاهده جزئیات
                    </DropdownItem>
                </DropdownContent>
            </Dropdown>
        </div>
    );
};