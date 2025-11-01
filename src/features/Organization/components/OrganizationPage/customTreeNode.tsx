"use client";

import { useState } from 'react';
import { type Organization } from '@/features/Organization/types';

// --- هوک‌ها ---
import { useDeleteOrganization } from '@/features/Organization/hooks/useOrganizations';

// --- کامپوننت‌های UI (بدون تغییر) ---
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
    ChevronRight,
    Users
} from 'lucide-react';

// --- ۱. افزودن پراپ onEdit ---
interface OrganizationNodeProps {
    node: Organization;
    level: number;
    isSuperAdmin: boolean;
    expandedIds: Record<string, boolean>;
    onToggle: (nodeId: number | string) => void;
    onAddChild: (parentId: number) => void;
    onNodeClick: (nodeId: number) => void;
    onEdit: (organization: Organization) => void; // پراپ جدید
}

export const OrganizationNode = ({
    node,
    level,
    isSuperAdmin,
    expandedIds,
    onToggle,
    onAddChild,
    onNodeClick,
    onEdit // دریافت پراپ جدید
}: OrganizationNodeProps) => {

    // --- مدیریت حذف (بدون تغییر) ---
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

    // --- منطق باز/بسته بودن (بدون تغییر) ---
    const isExpanded = expandedIds[String(node.id)] === true;
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 20;

    return (
        <>
            {/* ردیف اصلی نود (بدون تغییر) */}
            <div
                style={{ paddingRight: `${indent}px` }}
                className={`flex gap-2 items-center h-10 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 `}
            >
                {/* ۱. آیکون باز/بسته کردن (بدون تغییر) */}
                <div
                    className="w-6 flex items-center justify-center"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (hasChildren) {
                            onToggle(node.id);
                        }
                    }}
                >
                    {hasChildren && (
                        isExpanded ?
                            <ChevronDown className="h-4 w-4 dark:text-primaryD cursor-pointer" /> :
                            <ChevronRight className="h-4 w-4 dark:text-primaryD cursor-pointer" />
                    )}
                </div>

                {/* ۲. آیکون و نام سازمان (بدون تغییر) */}
                <Building className="h-4 w-4 mr-2 text-muted-foregroundL dark:text-primaryD" />
                <span className="truncate dark:text-primaryD">{node.name}</span>

                {/* ۳. فاصله انداز (بدون تغییر) */}
                <div className="flex-grow" />

                {/* ۴. منوی عملیات (تغییر در آیتم ویرایش) */}
                {isSuperAdmin && (
                    <div className="ml-2" onClick={(e) => e.stopPropagation()}>
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4 cursor-pointer dark:text-primaryD" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownContent>
                                {/* آیتم "مشاهده کارمندان" (بدون تغییر) */}
                                <DropdownItem
                                    icon={<Users className="h-4 w-4" />}
                                    onClick={() => onNodeClick(node.id)}
                                >
                                    مشاهده کارمندان
                                </DropdownItem>

                                {isSuperAdmin && (
                                    <>
                                        {/* آیتم "افزودن" (بدون تغییر) */}
                                        <DropdownItem
                                            icon={<Plus className="h-4 w-4" />}
                                            onClick={() => onAddChild(node.id)}
                                        >
                                            افزودن زیرمجموعه
                                        </DropdownItem>

                                        {/* --- ۲. به‌روزرسانی آیتم ویرایش --- */}
                                        <DropdownItem
                                            icon={<Edit2 className="h-4 w-4" />}
                                            // به جای alert، تابع onEdit را با آبجکت نود صدا می‌زنیم
                                            onClick={() => onEdit(node)}
                                        >
                                            ویرایش
                                        </DropdownItem>

                                        {/* آیتم "حذف" (بدون تغییر) */}
                                        <DropdownItem
                                            icon={<Trash2 className="h-4 w-4" />}
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="text-red-600 dark:text-red-500"
                                        >
                                            حذف
                                        </DropdownItem>
                                    </>
                                )}
                            </DropdownContent>
                        </Dropdown>
                    </div>
                )}
            </div>

            {/* بخش رندر فرزندان (بدون تغییر) */}
            {isExpanded && hasChildren && (
                <div className="children-container">
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
                            onEdit={onEdit} // --- ۳. پاس دادن پراپ به فرزندان ---
                        />
                    ))}
                </div>
            )}

            {/* مودال حذف (بدون تغییر) */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="تأیید حذف"
                message={
                    <>
                        <p>
                            آیا از حذف سازمان <strong className="font-bold">{node.name}</strong> مطمئن هستید؟
                        </p>
                        {deleteError && (
                            <div className="mt-4">
                                <Alert variant="destructive">
                                    <AlertTitle>خطا</AlertTitle>
                                    <AlertDescription>{deleteError}</AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </>
                }
                variant="danger"
                confirmText={deleteMutation.isPending ? "در حال حذف..." : "حذف کن"}
                cancelText="انصراف"
            />
        </>
    );
};
