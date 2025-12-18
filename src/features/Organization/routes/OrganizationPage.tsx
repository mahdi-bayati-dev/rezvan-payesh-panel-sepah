import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizations } from '@/features/Organization/hooks/useOrganizations';
import { type Organization } from '@/features/Organization/types';
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';
import { flattenOrganizations, getAllDescendantIds } from '@/features/Organization/utils/treeUtils';

import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';
import {
    Plus,
    Network,
    Building2
} from 'lucide-react';

import { OrganizationForm } from '@/features/Organization/components/newOrganization/OrganizationForm';
import { OrganizationNode } from '@/features/Organization/components/OrganizationPage/OrganizationNode';
import { OrganizationTreeSkeleton } from '@/features/Organization/Skeleton/SkeletonNode';
import { OrganizationFormSkeleton } from '@/features/Organization/Skeleton/OrganizationFormSkeleton';

function OrganizationPage() {
    const user = useAppSelector(selectUser);
    const isSuperAdmin = user?.roles?.includes('super_admin') ?? false;
    const navigate = useNavigate();

    const [modalState, setModalState] = useState<{
        type: 'create' | 'edit' | null;
        parentId?: number | null;
        editingOrg?: Organization | null;
    }>({ type: null });

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

    const handleOpenCreateRoot = useCallback(() => {
        setModalState({ type: 'create', parentId: null });
    }, []);

    const handleOpenCreateChild = useCallback((parentId: number) => {
        setModalState({ type: 'create', parentId });
    }, []);

    const handleOpenEdit = useCallback((org: Organization) => {
        setModalState({ type: 'edit', editingOrg: org });
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalState({ type: null });
    }, []);

    const forbiddenParentIds = useMemo(() => {
        if (modalState.type === 'edit' && modalState.editingOrg) {
            return [modalState.editingOrg.id, ...getAllDescendantIds(modalState.editingOrg)];
        }
        return [];
    }, [modalState.type, modalState.editingOrg]);

    if (isLoading) {
        return (
            <div className="p-4 md:p-8  mx-auto space-y-6" dir="rtl">
                <div className="flex justify-between items-center mb-6 border-b border-borderL dark:border-borderD pb-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-2xl" />
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-36 rounded-lg" />
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
            <div className="p-8 max-w-4xl mx-auto" dir="rtl">
                <Alert variant="destructive" className="bg-destructiveL-background dark:bg-destructiveD-background border-destructiveL-foreground/10 text-destructiveL-foreground dark:text-destructiveD-foreground">
                    <AlertTitle>خطا در بارگذاری اطلاعات</AlertTitle>
                    <AlertDescription>
                        {(error as any)?.message || "خطای ناشناخته در دریافت چارت سازمانی"}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8  mx-auto space-y-6 animate-in fade-in duration-500" dir="rtl">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-borderL dark:border-borderD">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-2xl transition-colors shadow-sm",
                        "bg-primaryL/10 text-primaryL dark:bg-primaryD/10 dark:text-primaryD"
                    )}>
                        <Network className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foregroundL dark:text-foregroundD">
                            چارت سازمانی
                        </h1>
                        <p className="text-sm text-muted-foregroundL dark:text-muted-foregroundD mt-1">
                            نمایش درختی ساختار سازمان و مدیریت واحدهای زیرمجموعه
                        </p>
                    </div>
                </div>

                {isSuperAdmin && (
                    <Button
                        variant="primary"
                        onClick={handleOpenCreateRoot}
                        className="shadow-lg shadow-primaryL/20 hover:shadow-primaryL/30 transition-all"
                    >
                        <Plus className="h-5 w-5 ml-2" />
                        افزودن سازمان ریشه
                    </Button>
                )}
            </div>

            <div className="bg-backgroundL-500 dark:bg-backgroundD p-4 rounded-lg shadow-sm border border-borderL dark:border-borderD min-h-[400px]">
                {(organizationsData && organizationsData.length > 0) ? (
                    <div className="flex flex-col">
                        {organizationsData.map(rootNode => (
                            <OrganizationNode
                                key={rootNode.id}
                                node={rootNode}
                                level={0}
                                isSuperAdmin={isSuperAdmin}
                                expandedIds={expandedIds}
                                onToggle={handleToggle}
                                onAddChild={handleOpenCreateChild}
                                onNodeClick={handleNodeClick}
                                onEdit={handleOpenEdit}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-80 text-muted-foregroundL dark:text-muted-foregroundD bg-secondaryL/20 dark:bg-secondaryD/10 rounded-lg border-2 border-dashed border-borderL dark:border-borderD">
                        <div className="p-4 rounded-full bg-secondaryL dark:bg-secondaryD mb-4">
                            <Building2 className="h-8 w-8 opacity-40" />
                        </div>
                        <p className="font-medium">هنوز چارت سازمانی تعریف نشده است.</p>
                        {isSuperAdmin && (
                            <Button variant="link" onClick={handleOpenCreateRoot} className="mt-2 text-primaryL dark:text-primaryD">
                                ایجاد اولین سازمان
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <Modal isOpen={modalState.type !== null} onClose={handleCloseModal} size="lg">
                <ModalHeader onClose={handleCloseModal}>
                    <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                            {modalState.type === 'create' ? <Plus className="h-5 w-5 text-primaryL dark:text-primaryD" /> : <Building2 className="h-5 w-5 text-primaryL dark:text-primaryD" />}
                            <span className="text-lg font-bold text-foregroundL dark:text-foregroundD">
                                {modalState.type === 'create'
                                    ? (modalState.parentId ? "ایجاد زیرمجموعه جدید" : "ایجاد سازمان ریشه")
                                    : `ویرایش سازمان: ${modalState.editingOrg?.name}`
                                }
                            </span>
                        </div>
                        <span className="text-sm font-normal text-muted-foregroundL dark:text-muted-foregroundD mr-7">
                            {modalState.type === 'create'
                                ? "اطلاعات واحد سازمانی جدید را وارد کنید."
                                : "تغییرات مورد نظر را اعمال کنید."}
                        </span>
                    </div>
                </ModalHeader>
                <ModalBody>
                    {modalState.type && (
                        <OrganizationForm
                            defaultOrganization={modalState.editingOrg}
                            defaultParentId={modalState.parentId}
                            organizationList={flatOrganizationList}
                            forbiddenParentIds={forbiddenParentIds}
                            onSuccess={handleCloseModal}
                        />
                    )}
                </ModalBody>
            </Modal>
        </div>
    );
}

export default OrganizationPage;