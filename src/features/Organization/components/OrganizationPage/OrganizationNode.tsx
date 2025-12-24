import { useState, memo, useCallback } from 'react';
import { type Organization } from '@/features/Organization/types';
import { useDeleteOrganization } from '@/features/Organization/hooks/useOrganizations';

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
    Building2,
    Store,
    Briefcase,
    ChevronDown,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'react-toastify';

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
        if (deleteMutation.isPending) return;
        setDeleteError(null);

        deleteMutation.mutate(node.id, {
            onSuccess: () => {
                setShowDeleteConfirm(false);
                toast.success("سازمان با موفقیت حذف شد.");
            },
            onError: (error: any) => {
                if (error.response?.status === 422) {
                    setDeleteError("این سازمان دارای زیرمجموعه است و قابل حذف نیست. ابتدا زیرمجموعه‌های آن را حذف یا منتقل کنید.");
                } else {
                    const msg = error?.response?.data?.message || "خطای غیرمنتظره‌ای رخ داد.";
                    setDeleteError(msg);
                }
            }
        });
    };

    const handleToggleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(node.id);
    }, [node.id, onToggle]);

    const handleNodeClickAction = useCallback(() => {
        onNodeClick(node.id);
    }, [node.id, onNodeClick]);

    const isExpanded = !!expandedIds[String(node.id)];
    const hasChildren = node.children && node.children.length > 0;

    const indentSize = level * 1.5;

    const IconComponent = level === 0 ? Building2 :
        level === 1 ? Building :
            level === 2 ? Store : Briefcase;

    return (
        <>
            <div
                className={cn(
                    "group relative flex items-center gap-3 py-3 px-4 my-1.5 rounded-xl border transition-all duration-200",
                    "focus-within:z-50 [&:has([aria-expanded=true])]:z-50 relative",
                    "bg-transparent border-transparent",
                    // اصلاح رنگ‌های هاور
                    "hover:bg-backgroundL-500 dark:hover:bg-backgroundD hover:shadow-sm hover:border-borderL dark:hover:border-borderD hover:scale-[1.005]",
                    // اصلاح رنگ‌های فعال/باز
                    isExpanded && hasChildren && !level ? "bg-secondaryL/50 dark:bg-secondaryD/20" : ""
                )}
                style={{ paddingRight: `calc(0.75rem + ${indentSize}rem)` }}
            >
                <button
                    type="button"
                    className={cn(
                        "w-6 h-6 flex items-center justify-center rounded-md transition-all duration-200 shrink-0",
                        hasChildren
                            ? "hover:bg-secondaryL dark:hover:bg-secondaryD cursor-pointer text-muted-foregroundL dark:text-muted-foregroundD"
                            : "opacity-0 pointer-events-none"
                    )}
                    onClick={handleToggleClick}
                    aria-label={isExpanded ? "بستن زیرمجموعه" : "باز کردن زیرمجموعه"}
                >
                    {hasChildren && (
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                !isExpanded && "rotate-90 rtl:-rotate-90"
                            )}
                        />
                    )}
                </button>

                <div
                    className="flex items-center gap-3 flex-1 cursor-pointer min-w-0 select-none"
                    onClick={handleNodeClickAction}
                >
                    <span className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                        // استفاده از primary به جای blue
                        "bg-primaryL/10 dark:bg-primaryD/10 text-primaryL dark:text-primaryD",
                        "group-hover:bg-primaryL/20 dark:group-hover:bg-primaryD/20"
                    )}>
                        <IconComponent className="h-4 w-4" />
                    </span>

                    <div className="flex flex-col">
                        <span className="truncate text-sm font-semibold text-foregroundL dark:text-foregroundD group-hover:text-primaryL dark:group-hover:text-primaryD transition-colors">
                            {node.name}
                        </span>
                    </div>

                    {hasChildren && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondaryL dark:bg-secondaryD text-muted-foregroundL dark:text-muted-foregroundD border border-borderL dark:border-borderD">
                            {node.children?.length.toLocaleString('fa-IR')}
                        </span>
                    )}
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foregroundL hover:text-foregroundL hover:bg-secondaryL dark:text-muted-foregroundD dark:hover:text-foregroundD dark:hover:bg-secondaryD transition-colors"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownContent className="w-52">
                            <DropdownItem icon={<Users className="h-4 w-4" />} onClick={handleNodeClickAction}>
                                مشاهده سربازان
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
                                        className="text-destructiveL dark:text-destructiveD focus:text-destructiveL dark:focus:text-destructiveD focus:bg-destructiveL/10 dark:focus:bg-destructiveD/10"
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
                <div className="relative animate-in fade-in slide-in-from-top-1 duration-200">
                    <div
                        className="absolute top-0 bottom-3 border-r-2 border-dashed border-borderL dark:border-borderD"
                        style={{ right: `calc(0.75rem + ${indentSize}rem + 11px)` }}
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
                    onClose={() => { setDeleteError(null); setShowDeleteConfirm(false); }}
                    onConfirm={handleDelete}
                    title="حذف واحد سازمانی"
                    message={
                        <div className="space-y-4">
                            <p>آیا از حذف <strong className="text-destructiveL dark:text-destructiveD">{node.name}</strong> اطمینان دارید؟</p>

                            {!deleteError && (
                                <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD">این سازمان  تعداد {node.children?.length.toLocaleString('fa-IR') || 0}  زیرمجموعه دارد ، میخواهید ان را حذف کنید؟</p>
                            )}

                            {deleteError && (
                                <Alert variant="destructive" className="animate-in fade-in zoom-in-95 duration-200 bg-destructiveL-background dark:bg-destructiveD-background border-destructiveL-foreground/10">
                                    <AlertTitle className="text-destructiveL-foreground dark:text-destructiveD-foreground">خطا در حذف</AlertTitle>
                                    <AlertDescription className="text-destructiveL-foreground dark:text-destructiveD-foreground">{deleteError}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    }
                    variant="danger"
                    confirmText={deleteMutation.isPending ? "در حال حذف..." : "حذف شود"}
                    cancelText="انصراف"
                    isLoading={deleteMutation.isPending}
                />
            )}
        </>
    );
};

export const OrganizationNode = memo(OrganizationNodeComponent, (prevProps, nextProps) => {
    if (prevProps.node !== nextProps.node) return false;
    if (prevProps.isSuperAdmin !== nextProps.isSuperAdmin) return false;

    const prevIsExpanded = !!prevProps.expandedIds[String(prevProps.node.id)];
    const nextIsExpanded = !!nextProps.expandedIds[String(nextProps.node.id)];

    if (prevIsExpanded !== nextIsExpanded) return false;
    if (nextIsExpanded) return false;

    return true;
});

OrganizationNode.displayName = 'OrganizationNode';