"use client";

// --- ۱. ایمپورت‌های مورد نیاز ---
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// --- هوک‌ها و تایپ‌ها ---
import { useOrganizations } from '@/features/Organization/hooks/useOrganizations';
import { type Organization } from '@/features/Organization/types'; // ایمپورت تایپ
// --- Redux (بدون تغییر) ---
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';

// --- کامپوننت‌های UI ---
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { PlusCircle } from 'lucide-react';
import { OrganizationForm } from '@/features/Organization/components/newOrganization/OrganizationForm';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/Modal';
import { OrganizationNode } from '@/features/Organization/components/OrganizationPage/customTreeNode';

import { Skeleton } from '@/components/ui/Skeleton'; // اسکلت پایه
import { OrganizationTreeSkeleton } from '@/features/Organization/Skeleton/SkeletonNode';
import { OrganizationFormSkeleton } from '@/features/Organization/Skeleton/OrganizationFormSkeleton'
interface FlatOrgOption {
    id: number;
    name: string;
    level: number;
    parent_id: number | null;
}

/**
 * یک آرایه از سازمان‌های تودرتو را به یک لیست مسطح تبدیل می‌کند
 * تا در دراپ‌다운 فرم ویرایش استفاده شود.
 */
const flattenOrganizations = (
    orgs: Organization[],
    level = 0
): FlatOrgOption[] => {
    let flatList: FlatOrgOption[] = [];
    for (const org of orgs) {
        flatList.push({
            id: org.id,
            name: org.name,
            level: level,
            parent_id: org.parent_id
        });
        if (org.children && org.children.length > 0) {
            flatList = flatList.concat(
                flattenOrganizations(org.children, level + 1)
            );
        }
    }
    return flatList;
};


function OrganizationPage() {

    // --- Redux (بدون تغییر) ---
    const user = useAppSelector(selectUser);
    const isSuperAdmin = user?.roles?.includes('super_admin') ?? false;

    // --- State مودال ایجاد (بدون تغییر) ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [parentIdToCreate, setParentIdToCreate] = useState<number | null>(null);

    // --- ۳. State جدید برای مودال ویرایش ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);

    const navigate = useNavigate();
    // --- فچ کردن داده‌ها (بدون تغییر) ---
    const {
        data: organizationsData, // این همان آرایه تودرتو (درخت) است
        isLoading,
        isError,
        error,
    } = useOrganizations();

    // --- ۴. ساخت لیست مسطح برای فرم ویرایش ---
    // useMemo باعث می‌شود این لیست فقط زمانی که داده‌های اصلی تغییر می‌کنند، دوباره ساخته شود
    const flatOrganizationList = useMemo(() => {
        if (!organizationsData) return [];
        return flattenOrganizations(organizationsData);
    }, [organizationsData]);


    // --- State باز/بسته بودن (بدون تغییر) ---
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

    const handleToggle = useCallback((nodeId: string | number) => {
        const id = String(nodeId);
        setExpandedIds(prev => ({
            ...prev,
            [id]: !prev[id] // هرچی بود برعکس کن
        }));
    }, []);

    // --- مدیریت ناوبری (بدون تغییر) ---
    const handleNodeClick = useCallback((nodeId: number) => {
        navigate(`/organizations/${nodeId}`);
    }, [navigate]);

    // --- مدیریت مودال ایجاد (بدون تغییر) ---
    const handleOpenCreateRootModal = () => {
        setParentIdToCreate(null);
        setIsCreateModalOpen(true);
    };
    const handleOpenCreateChildModal = useCallback((parentId: number) => {
        setParentIdToCreate(parentId);
        setIsCreateModalOpen(true);
    }, []);
    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setParentIdToCreate(null);
    };

    // --- ۵. توابع مدیریت مودال ویرایش ---
    const handleOpenEditModal = useCallback((organization: Organization) => {
        setEditingOrganization(organization);
        setIsEditModalOpen(true);
    }, []);

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingOrganization(null);
    };


    // (بخش Loading/Error بدون تغییر)
    if (isLoading) {
        return (
            // ما کل صفحه (شامل هدر) را اسکلت‌بندی می‌کنیم
            <div className="p-4 md:p-6" dir="rtl">
                {/* شبیه‌سازی هدر صفحه */}
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-10 w-36" />
                </div>

                {/* شبیه‌سازی چیدمان گرید دو ستونه */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* ستون درخت */}
                    <div className="md:col-span-2">
                        <OrganizationTreeSkeleton />
                    </div>
                    {/* ستون فرم */}
                    <div className="md:col-span-1">
                        <OrganizationFormSkeleton />
                    </div>
                </div>
            </div>
        );
    }
    if (isError) {
        return (
            <div className="p-8 max-w-2xl mx-auto" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطا در بارگذاری چارت سازمانی</AlertTitle>
                    <AlertDescription>
                        <p>{(error as any)?.message || "خطای ناشناخته"}</p>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6" dir="rtl">
            {/* هدر صفحه (بدون تغییر) */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold dark:text-borderL">چارت سازمانی</h1>
                {isSuperAdmin && (
                    <Button
                        variant="primary"
                        onClick={handleOpenCreateRootModal}
                    >
                        <PlusCircle className="h-4 w-4 ml-2" />
                        افزودن سازمان ریشه
                    </Button>
                )}
            </div>

            {/* کانتینر درخت */}
            <div
                className="w-full p-4 rounded-lg border border-borderL dark:border-borderD 
				bg-backgroundL-500 dark:bg-backgroundD overflow-auto pb-48 "
            >

                {(organizationsData && organizationsData.length > 0) ? (
                    organizationsData.map(rootNode => (
                        <OrganizationNode
                            onNodeClick={handleNodeClick}
                            key={rootNode.id}
                            node={rootNode} // خود آبجکت سازمان
                            level={0} // سطح ریشه
                            isSuperAdmin={isSuperAdmin}
                            expandedIds={expandedIds} // استیت باز/بسته بودن
                            onToggle={handleToggle} // تابع تغییر استیت
                            onAddChild={handleOpenCreateChildModal}
                            // --- ۶. پاس دادن تابع ویرایش ---
                            onEdit={handleOpenEditModal}
                        />
                    ))
                ) : (
                    <p className="text-center text-muted-foregroundL dark:text-muted-foregroundD">
                        هنوز سازمانی ایجاد نشده است.
                    </p>
                )}
            </div>

            {/* مودال ایجاد سازمان (بدون تغییر) */}
            <Modal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal}>
                <ModalHeader onClose={handleCloseCreateModal}>
                    <h3 className="text-lg font-bold">
                        {parentIdToCreate
                            ? "ایجاد زیرمجموعه جدید"
                            : "ایجاد سازمان ریشه جدید"}
                    </h3>
                </ModalHeader>
                <ModalBody>
                    <OrganizationForm
                        // در حالت ایجاد، ما لیست سازمان‌ها را نیاز نداریم
                        // (مگر اینکه بخواهید امکان انتخاب والد را همینجا هم بدهید)
                        defaultParentId={parentIdToCreate}
                        onSuccess={() => {
                            handleCloseCreateModal();
                        }}
                    />
                </ModalBody>
            </Modal>

            {/* --- ۷. مودال جدید ویرایش --- */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
                <ModalHeader onClose={handleCloseEditModal}>
                    <h3 className="text-lg font-bold">
                        ویرایش سازمان: {editingOrganization?.name}
                    </h3>
                </ModalHeader>
                <ModalBody>
                    {/* ما همان فرم قبلی را استفاده می‌کنیم، اما این بار 
                      هم آبجکت سازمان (برای پر کردن فیلدها) 
                      و هم لیست مسطح (برای دراپ‌다운 والد) را به آن پاس می‌دهیم
                    */}
                    <OrganizationForm
                        defaultOrganization={editingOrganization!} // آبجکت برای ویرایش
                        organizationList={flatOrganizationList} // لیست برای انتخاب والد
                        onSuccess={() => {
                            handleCloseEditModal();
                        }}
                    />
                </ModalBody>
            </Modal>

        </div>
    );
}

export default OrganizationPage;
