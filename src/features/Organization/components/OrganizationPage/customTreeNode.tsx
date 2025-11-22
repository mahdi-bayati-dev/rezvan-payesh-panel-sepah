"use client";

import { useState, memo } from 'react';
import { type Organization } from '@/features/Organization/types';

// --- هوک‌ها ---
import { useDeleteOrganization } from '@/features/Organization/hooks/useOrganizations';

// --- کامپوننت‌های UI ---
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui/Dropdown';
import {
    MoreHorizontal,
    Edit2,
    Trash2,
    Plus,
    Building,
    ChevronDown,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OrganizationNodeProps {
    node: Organization;
    level: number;
    isSuperAdmin: boolean;
    expandedIds: Record<string, boolean>;
    onToggle: (nodeId: number | string) => void;
    onAddChild: (parentId: number) => void;
    onNodeClick: (nodeId: number) => void;
    onEdit: (organization: Organization) => void;
}

/**
 * کامپوننت نود سازمانی
 */
const OrganizationNodeComponent = ({
    node,
    level,
    isSuperAdmin,
    expandedIds,
    onToggle,
    onAddChild,
    onNodeClick,
    onEdit
}: OrganizationNodeProps) => {

    const deleteMutation = useDeleteOrganization();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleDelete = async () => {
        const idToDelete = node.id;
        if (!idToDelete || deleteMutation.isPending) return;
        setDeleteError(null);
        deleteMutation.mutate(idToDelete, {
            onSuccess: () => {
                setShowDeleteConfirm(false);
            },
            onError: (error: any) => {
                if (error.response?.status === 422) {
                    setDeleteError(error.response.data.message);
                } else {
                    setDeleteError("خطای غیرمنتظره‌ای رخ داد.");
                }
            }
        });
    };

    const isExpanded = expandedIds[String(node.id)] === true;
    const hasChildren = node.children && node.children.length > 0;
    
    const paddingRight = `${level * 1.5}rem`;

    return (
        <>
            <div
                className={cn(
                    "group flex items-center gap-3 py-2 px-3 my-1 rounded-lg transition-all duration-200 border border-transparent",
                    "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700",
                    isExpanded && hasChildren ? "bg-gray-50 dark:bg-gray-800/30" : ""
                )}
                style={{ paddingRight: `calc(0.75rem + ${paddingRight})` }}
            >
                <button
                    type="button"
                    className={cn(
                        "w-6 h-6 flex items-center justify-center rounded-md transition-colors",
                        hasChildren ? "hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-muted-foregroundL" : "opacity-0 pointer-events-none"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (hasChildren) onToggle(node.id);
                    }}
                >
                    {hasChildren && (
                        <ChevronDown 
                            className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                !isExpanded && "rotate-90" 
                            )} 
                        />
                    )}
                </button>

                <div 
                    className="flex items-center gap-2 flex-1 cursor-pointer min-w-0"
                    onClick={() => onNodeClick(node.id)}
                >
                    <span className={cn(
                        "p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                        "group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors"
                    )}>
                        <Building className="h-4 w-4" />
                    </span>
                    
                    <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-primaryL dark:group-hover:text-primaryD transition-colors">
                        {node.name}
                    </span>
                    
                    {hasChildren && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                            {node.children?.length}
                        </span>
                    )}
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownContent>
                            <DropdownItem icon={<Users className="h-4 w-4" />} onClick={() => onNodeClick(node.id)}>
                                مشاهده کارمندان
                            </DropdownItem>

                            {isSuperAdmin && (
                                <>
                                    <DropdownItem icon={<Plus className="h-4 w-4" />} onClick={() => onAddChild(node.id)}>
                                        افزودن زیرمجموعه
                                    </DropdownItem>
                                    <DropdownItem icon={<Edit2 className="h-4 w-4" />} onClick={() => onEdit(node)}>
                                        ویرایش نام
                                    </DropdownItem>
                                    <DropdownItem 
                                        icon={<Trash2 className="h-4 w-4" />} 
                                        onClick={() => setShowDeleteConfirm(true)} 
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                    >
                                        حذف سازمان
                                    </DropdownItem>
                                </>
                            )}
                        </DropdownContent>
                    </Dropdown>
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div className="relative">
                    <div 
                        className="absolute top-0 bottom-0 border-r border-dashed border-gray-200 dark:border-gray-700"
                        style={{ right: `calc(0.75rem + ${paddingRight} + 11px)` }} 
                    />
                    
                    {node.children!.map(childNode => (
                        <OrganizationNode
                            key={childNode.id}
                            node={childNode}
                            level={level + 1}
                            isSuperAdmin={isSuperAdmin}
                            expandedIds={expandedIds}
                            onToggle={onToggle}
                            onAddChild={onAddChild}
                            onNodeClick={onNodeClick}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            )}

            {isSuperAdmin && (
                <ConfirmationModal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDelete}
                    title="حذف واحد سازمانی"
                    message={
                        <div className="space-y-2">
                            <p>آیا از حذف <strong className="text-red-600">{node.name}</strong> اطمینان دارید؟</p>
                            <p className="text-sm text-muted-foregroundL">توجه: با حذف این سازمان، تمام زیرمجموعه‌های آن نیز حذف خواهند شد.</p>
                            {deleteError && (
                                <Alert variant="destructive" className="mt-2">
                                    <AlertTitle>خطا</AlertTitle>
                                    <AlertDescription>{deleteError}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    }
                    variant="danger"
                    confirmText={deleteMutation.isPending ? "در حال حذف..." : "حذف شود"}
                    cancelText="انصراف"
                />
            )}
        </>
    );
};

// ✅✅✅ اصلاحیه: منطق مقایسه memo
export const OrganizationNode = memo(OrganizationNodeComponent, (prevProps, nextProps) => {
    // 1. اگر خود دیتای نود تغییر کرده، رندر کن
    if (prevProps.node !== nextProps.node) return false;
    
    // 2. وضعیت باز/بسته بودن خود نود را چک کن
    const prevIsExpanded = prevProps.expandedIds[String(prevProps.node.id)];
    const nextIsExpanded = nextProps.expandedIds[String(nextProps.node.id)];
    if (prevIsExpanded !== nextIsExpanded) return false;

    // 3. 🚨 نکته حیاتی: اگر نود در حال حاضر باز است (nextIsExpanded === true)، 
    // باید حتما رندر شود تا expandedIds جدید را به فرزندانش پاس دهد.
    // اگر رندر نشود، فرزندانش نسخه قدیمی expandedIds را دارند و متوجه تغییرات نمی‌شوند.
    if (nextIsExpanded) return false;

    // 4. چک کردن ادمین بودن
    if (prevProps.isSuperAdmin !== nextProps.isSuperAdmin) return false;

    // اگر هیچکدام از موارد بالا نبود، یعنی نود بسته است و تغییری نکرده -> رندر نکن (بهینه‌سازی)
    return true; 
});

OrganizationNode.displayName = 'OrganizationNode';