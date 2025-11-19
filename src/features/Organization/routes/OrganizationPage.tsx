
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizations } from '@/features/Organization/hooks/useOrganizations';
import { type Organization, type FlatOrgOption } from '@/features/Organization/types';
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';

import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { PlusCircle } from 'lucide-react';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/Modal';
import { OrganizationForm } from '@/features/Organization/components/newOrganization/OrganizationForm';
import { OrganizationNode } from '@/features/Organization/components/OrganizationPage/customTreeNode';
import { Skeleton } from '@/components/ui/Skeleton';
import { OrganizationTreeSkeleton } from '@/features/Organization/Skeleton/SkeletonNode';
import { OrganizationFormSkeleton } from '@/features/Organization/Skeleton/OrganizationFormSkeleton';

// تبدیل درخت به لیست مسطح
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

/**
 * پیدا کردن تمام ID های زیرمجموعه یک سازمان خاص
 * برای جلوگیری از انتخاب فرزند به عنوان والد (Circular Dependency)
 */
const getAllDescendantIds = (org: Organization): number[] => {
    let ids: number[] = [];
    if (org.children && org.children.length > 0) {
        for (const child of org.children) {
            ids.push(child.id);
            ids = ids.concat(getAllDescendantIds(child));
        }
    }
    return ids;
};


function OrganizationPage() {
    const user = useAppSelector(selectUser);
    const isSuperAdmin = user?.roles?.includes('super_admin') ?? false;
    const navigate = useNavigate();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [parentIdToCreate, setParentIdToCreate] = useState<number | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
    // نگهداری ID هایی که نباید در فرم ویرایش انتخاب شوند
    const [forbiddenParentIds, setForbiddenParentIds] = useState<number[]>([]);

    const {
        data: organizationsData,
        isLoading,
        isError,
        error,
    } = useOrganizations();

    const flatOrganizationList = useMemo(() => {
        if (!organizationsData) return [];
        return flattenOrganizations(organizationsData);
    }, [organizationsData]);

    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

    const handleToggle = useCallback((nodeId: string | number) => {
        const id = String(nodeId);
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    const handleNodeClick = useCallback((nodeId: number) => {
        navigate(`/organizations/${nodeId}`);
    }, [navigate]);

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

    const handleOpenEditModal = useCallback((organization: Organization) => {
        setEditingOrganization(organization);
        
        // محاسبه ID هایی که نباید انتخاب شوند (خودش + تمام فرزندانش)
        const descendants = getAllDescendantIds(organization);
        setForbiddenParentIds([organization.id, ...descendants]);
        
        setIsEditModalOpen(true);
    }, []);

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingOrganization(null);
        setForbiddenParentIds([]);
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-6" dir="rtl">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2"><OrganizationTreeSkeleton /></div>
                    <div className="md:col-span-1"><OrganizationFormSkeleton /></div>
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
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold dark:text-borderL">چارت سازمانی</h1>
                {isSuperAdmin && (
                    <Button variant="primary" onClick={handleOpenCreateRootModal}>
                        <PlusCircle className="h-4 w-4 ml-2" />
                        افزودن سازمان ریشه
                    </Button>
                )}
            </div>

            <div className="w-full p-4 rounded-lg border border-borderL dark:border-borderD bg-backgroundL-500 dark:bg-backgroundD overflow-auto pb-48">
                {(organizationsData && organizationsData.length > 0) ? (
                    organizationsData.map(rootNode => (
                        <OrganizationNode
                            key={rootNode.id}
                            node={rootNode}
                            level={0}
                            isSuperAdmin={isSuperAdmin}
                            expandedIds={expandedIds}
                            onToggle={handleToggle}
                            onAddChild={handleOpenCreateChildModal}
                            onNodeClick={handleNodeClick}
                            onEdit={handleOpenEditModal}
                        />
                    ))
                ) : (
                    <p className="text-center text-muted-foregroundL dark:text-muted-foregroundD">
                        هنوز سازمانی ایجاد نشده است.
                    </p>
                )}
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal}>
                <ModalHeader onClose={handleCloseCreateModal}>
                    <h3 className="text-lg font-bold">
                        {parentIdToCreate ? "ایجاد زیرمجموعه جدید" : "ایجاد سازمان ریشه جدید"}
                    </h3>
                </ModalHeader>
                <ModalBody>
                    <OrganizationForm
                        defaultParentId={parentIdToCreate}
                        onSuccess={handleCloseCreateModal}
                    />
                </ModalBody>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
                <ModalHeader onClose={handleCloseEditModal}>
                    <h3 className="text-lg font-bold">
                        ویرایش سازمان: {editingOrganization?.name}
                    </h3>
                </ModalHeader>
                <ModalBody>
                    <OrganizationForm
                        defaultOrganization={editingOrganization}
                        organizationList={flatOrganizationList}
                        forbiddenParentIds={forbiddenParentIds} // پراپ جدید برای جلوگیری از لوپ
                        onSuccess={handleCloseEditModal}
                    />
                </ModalBody>
            </Modal>
        </div>
    );
}

export default OrganizationPage;