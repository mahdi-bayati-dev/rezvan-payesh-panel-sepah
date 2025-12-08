"use client";

import { useState, memo, useCallback } from 'react';
import { type Organization } from '@/features/Organization/types';
import { useDeleteOrganization } from '@/features/Organization/hooks/useOrganizations';

// UI Components - استفاده از کامپوننت‌های خودت
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
import { toast } from 'react-toastify'; // اضافه کردن تست برای تجربه کاربری بهتر (اختیاری)

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
                // ✅ مدیریت خطای 422 (زمانی که زیرمجموعه دارد)
                if (error.response?.status === 422) {
                    // پیام فارسی و واضح برای ادمین
                    setDeleteError("این سازمان دارای زیرمجموعه است و قابل حذف نیست. ابتدا زیرمجموعه‌های آن را حذف یا منتقل کنید.");
                } else {
                    // سایر خطاها
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

    // محاسبه تورفتگی (Indentation)
    const indentSize = level * 1.5;

    // منطق انتخاب آیکون بر اساس عمق درخت
    const IconComponent = level === 0 ? Building2 :
        level === 1 ? Building :
            level === 2 ? Store : Briefcase;

    return (
        <>
            <div
                className={cn(
                    // --- استایل‌های اصلی ---
                    "group relative flex items-center gap-3 py-3 px-4 my-1.5 rounded-xl border transition-all duration-200",

                    // --- فیکس مشکل تداخل منوها (Z-Index Fix) ---
                    "focus-within:z-50 [&:has([aria-expanded=true])]:z-50 relative",

                    // --- حالت عادی ---
                    "bg-transparent border-transparent",

                    // --- حالت هاور ---
                    "hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700 hover:scale-[1.005]",

                    // --- حالت فعال/باز ---
                    isExpanded && hasChildren && !level ? "bg-gray-50/50 dark:bg-gray-800/20" : ""
                )}
                style={{ paddingRight: `calc(0.75rem + ${indentSize}rem)` }}
            >
                {/* دکمه باز/بسته کردن */}
                <button
                    type="button"
                    className={cn(
                        "w-6 h-6 flex items-center justify-center rounded-md transition-all duration-200 shrink-0",
                        hasChildren
                            ? "hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-gray-500"
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

                {/* نام و آیکون نود */}
                <div
                    className="flex items-center gap-3 flex-1 cursor-pointer min-w-0 select-none dark:text-backgroundL-500"
                    onClick={handleNodeClickAction}
                >
                    <span className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                        "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                        "group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40"
                    )}>
                        <IconComponent className="h-4 w-4" />
                    </span>

                    <div className="flex flex-col">
                        <span className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {node.name}
                        </span>
                    </div>

                    {hasChildren && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700">
                            {/* نمایش اعداد به فارسی */}
                            {node.children?.length.toLocaleString('fa-IR')}
                        </span>
                    )}
                </div>

                {/* منوی عملیات */}
                <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-backgroundL-500"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownContent className="w-52">
                            <DropdownItem icon={<Users className="h-4 w-4" />} onClick={handleNodeClickAction}>
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
                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                    >
                                        حذف سازمان
                                    </DropdownItem>
                                </>
                            )}
                        </DropdownContent>
                    </Dropdown>
                </div>
            </div>

            {/* رندر بازگشتی فرزندان */}
            {isExpanded && hasChildren && (
                <div className="relative animate-in fade-in slide-in-from-top-1 duration-200">
                    <div
                        className="absolute top-0 bottom-3 border-r-2 border-dashed border-gray-300 dark:border-gray-600"
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

            {/* مودال حذف */}
            {isSuperAdmin && (
                <ConfirmationModal
                    isOpen={showDeleteConfirm}
                    // اگر خطا داشتیم، با کلیک بیرون مدال بسته نشود تا کاربر پیام را ببیند (اختیاری)
                    onClose={() => { setDeleteError(null); setShowDeleteConfirm(false); }}
                    onConfirm={handleDelete}
                    title="حذف واحد سازمانی"
                    message={
                        <div className="space-y-4">
                            <p>آیا از حذف <strong className="text-destructive">{node.name}</strong> اطمینان دارید؟</p>

                            {!deleteError && (
                                <p className="text-sm text-muted-foreground">این سازمان  تعداد {node.children?.length.toLocaleString('fa-IR') || 0}  زیرمجموعه دارد ، میخواهید ان را حذف کنید؟</p>
                            )}

                            {/* نمایش خطا با کامپوننت Alert */}
                            {deleteError && (
                                <Alert variant="destructive" className="animate-in fade-in zoom-in-95 duration-200">
                                    <AlertTitle>خطا در حذف</AlertTitle>
                                    <AlertDescription>{deleteError}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    }
                    variant="danger"
                    // اگر خطا داریم، دکمه تایید غیرفعال شود تا کاربر مجبور شود کنسل کند یا مشکل را حل کند
                    // البته می‌توان دکمه را فعال گذاشت تا دوباره تلاش کند
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