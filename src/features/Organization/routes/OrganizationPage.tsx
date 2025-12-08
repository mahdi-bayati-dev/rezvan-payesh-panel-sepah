import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizations } from '@/features/Organization/hooks/useOrganizations';
import { type Organization } from '@/features/Organization/types';
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';
import { flattenOrganizations, getAllDescendantIds } from '@/features/Organization/utils/treeUtils';

// Components & UI
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';
import {
    PlusCircle,
    Building,
    Building2
} from 'lucide-react';

// Feature Components
import { OrganizationForm } from '@/features/Organization/components/newOrganization/OrganizationForm';
import { OrganizationNode } from '@/features/Organization/components/OrganizationPage/OrganizationNode';
import { OrganizationTreeSkeleton } from '@/features/Organization/Skeleton/SkeletonNode';
import { OrganizationFormSkeleton } from '@/features/Organization/Skeleton/OrganizationFormSkeleton';

function OrganizationPage() {
    const user = useAppSelector(selectUser);
    const isSuperAdmin = user?.roles?.includes('super_admin') ?? false;
    const navigate = useNavigate();

    // State for Modals (Unified State)
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

    // بهینه‌سازی محاسبات سنگین تبدیل درخت به لیست مسطح با useMemo
    const flatOrganizationList = useMemo(() => {
        if (!organizationsData) return [];
        return flattenOrganizations(organizationsData);
    }, [organizationsData]);

    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

    // استفاده از useCallback برای جلوگیری از ساخت مجدد تابع در هر رندر (جلوگیری از ری-رندر فرزندان)
    const handleToggle = useCallback((nodeId: string | number) => {
        const id = String(nodeId);
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    const handleNodeClick = useCallback((nodeId: number) => {
        navigate(`/organizations/${nodeId}`);
    }, [navigate]);

    // --- Modal Handlers ---
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

    // محاسبه لیست سیاه (خودش و فرزندانش) برای دراپ‌داون والد در حالت ویرایش
    // این کار از ایجاد سیکل (Circular Dependency) جلوگیری می‌کند
    const forbiddenParentIds = useMemo(() => {
        if (modalState.type === 'edit' && modalState.editingOrg) {
            return [modalState.editingOrg.id, ...getAllDescendantIds(modalState.editingOrg)];
        }
        return [];
    }, [modalState.type, modalState.editingOrg]);

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
                    <AlertTitle>خطا در بارگذاری اطلاعات</AlertTitle>
                    <AlertDescription>
                        {(error as any)?.message || "خطای ناشناخته در دریافت چارت سازمانی"}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500" dir="rtl">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl transition-colors shadow-sm",
                        "bg-white dark:bg-gray-800  dark:text-backgroundL-500 border border-gray-100 dark:border-gray-700"
                    )}>
                        <Building2 className="h-6 w-6" />
                    </span>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">چارت سازمانی</h1>
                </div>

                {isSuperAdmin && (
                    <Button variant="primary" onClick={handleOpenCreateRoot} className="shadow-md hover:shadow-lg transition-shadow">
                        <PlusCircle className="h-4 w-4 ml-2" />
                        افزودن سازمان ریشه
                    </Button>
                )}
            </div>

            {/* Tree Container */}
            <div className="w-full p-4 rounded-xl border  border-borderL shadow-sm transition-colors duration-300 dark:bg-backgroundD dark:border-borderD min-h-[400px] bg-backgroundL-500">
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
                    <div className="flex flex-col items-center justify-center h-80 text-muted-foreground bg-gray-50/50 dark:bg-gray-900/20 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                            <Building className="h-8 w-8 opacity-40" />
                        </div>
                        <p className="font-medium">هنوز چارت سازمانی تعریف نشده است.</p>
                        {isSuperAdmin && (
                            <Button variant="link" onClick={handleOpenCreateRoot} className="mt-2 text-primary">
                                ایجاد اولین سازمان
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Combined Modal for Create/Edit */}
            <Modal isOpen={modalState.type !== null} onClose={handleCloseModal}>
                <ModalHeader onClose={handleCloseModal}>
                    <div className="flex items-center gap-2">
                        {modalState.type === 'create' ? <PlusCircle className="h-5 w-5 dark:text-backgroundL-500" /> : <Building className="h-5 w-5 text-blue-600" />}
                        <h3 className="text-lg font-bold dark:text-backgroundL-500">
                            {modalState.type === 'create'
                                ? (modalState.parentId ? "ایجاد زیرمجموعه جدید" : "ایجاد سازمان ریشه")
                                : `ویرایش سازمان: ${modalState.editingOrg?.name}`
                            }
                        </h3>
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