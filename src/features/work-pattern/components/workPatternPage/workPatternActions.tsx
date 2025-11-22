import { Trash2, Edit, Users, Fingerprint, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeleteWeekPattern } from '@/features/work-pattern/hooks/useDeleteWeekPattern';
import { useState } from 'react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useDeleteShiftSchedule } from '@/features/shift-schedule/hooks/hook';
import { Dialog } from '@/components/ui/Dialog';
import { GenerateShiftsForm } from '@/features/shift-schedule/components/GenerateShiftsForm';
import clsx from 'clsx';

interface WorkPatternActionsProps {
  selectedPatternId: number | null;
  selectedPatternName: string | null;
  isShiftSchedule?: boolean;
  onActionComplete: () => void;
}

export const WorkPatternActions = ({
  selectedPatternId,
  selectedPatternName,
  isShiftSchedule = false,
  onActionComplete,
}: WorkPatternActionsProps) => {
  const navigate = useNavigate();

  // --- هوک‌های حذف ---
  const { mutate: deleteWeekPattern, isPending: isDeletingWeek } = useDeleteWeekPattern();
  const { mutate: deleteShiftSchedule, isPending: isDeletingShift } = useDeleteShiftSchedule();

  const deleteMutation = isShiftSchedule ? deleteShiftSchedule : deleteWeekPattern;
  const isDeleting = isDeletingWeek || isDeletingShift;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const isPatternSelected = selectedPatternId !== null;

  // --- هندلرها ---
  const handleEditPattern = () => {
    if (!isPatternSelected) return;
    if (isShiftSchedule) {
      navigate(`/shift-schedules/edit/${selectedPatternId}`);
    } else {
      navigate(`/work-patterns/edit/${selectedPatternId}`);
    }
  }

  const handleDeletePattern = () => {
    if (!isPatternSelected) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedPatternId) return;
    deleteMutation(selectedPatternId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        onActionComplete();
      },
      onError: (error) => {
        console.error("Delete failed:", error);
      }
    });
  };

  const handleViewEmployees = () => {
    if (selectedPatternId) {
      const patternType = isShiftSchedule ? 'schedule' : 'pattern';
      navigate(`/work-patterns/employees/${patternType}/${selectedPatternId}`);
    }
  }

  const getButtonStyle = (variant: 'primary' | 'success' | 'warning' | 'danger', disabled: boolean) => {
    const base = "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm active:scale-[0.98] border cursor-pointer";

    if (disabled) {
      return clsx(base, "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-secondaryD/20 dark:border-borderD dark:text-muted-foregroundD/40 shadow-none");
    }

    switch (variant) {
      case 'primary':
        return clsx(base, "bg-white text-blue-600 border-blue-200 hover:bg-blue-50 dark:bg-backgroundD dark:text-blue-400 dark:border-blue-900 dark:hover:bg-blue-900/20");
      case 'success':
        return clsx(base, "bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:bg-backgroundD dark:text-emerald-400 dark:border-emerald-900 dark:hover:bg-emerald-900/20");
      case 'warning': // استایل دکمه تولید
        return clsx(base, "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-transparent shadow-amber-500/20 hover:shadow-amber-500/30");
      case 'danger':
        return clsx(base, "bg-white text-rose-600 border-rose-200 hover:bg-rose-50 dark:bg-backgroundD dark:text-rose-400 dark:border-rose-900 dark:hover:bg-rose-900/20 mt-2");
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">

      <div className="p-5 bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-2xl shadow-sm flex flex-col gap-4 flex-1">
        <div>
          <h3 className="text-lg font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-primaryL dark:text-primaryD" />
            پنل عملیات
          </h3>
          <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-2 leading-5 min-h-[40px]">
            {isPatternSelected
              ? `الگوی فعال: «${selectedPatternName}»`
              : "جهت دسترسی به عملیات‌ها، ابتدا یک الگو را انتخاب کنید."}
          </p>
        </div>

        <div className="space-y-3 mt-1">
          <button
            onClick={handleEditPattern}
            disabled={!isPatternSelected || isDeleting}
            className={getButtonStyle('primary', !isPatternSelected || isDeleting)}
          >
            <Edit className="w-4 h-4" />
            ویرایش و مشاهده جزئیات
          </button>

          <button
            onClick={handleViewEmployees}
            disabled={!isPatternSelected || isDeleting}
            className={getButtonStyle('success', !isPatternSelected || isDeleting)}
          >
            <Users className="w-4 h-4 " />
            کارمندان متصل
          </button>

          {/* ✅ دکمه تولید شیفت: فقط اینجاست */}
          <div className="relative group">
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              disabled={!isPatternSelected || !isShiftSchedule || isDeleting}
              className={getButtonStyle('warning', !isPatternSelected || !isShiftSchedule || isDeleting)}
            >
              {isDeleting ? <span className="animate-pulse">...</span> : <Cpu className="w-4 h-4" />}
              تولید و تخصیص شیفت
            </button>

            {isPatternSelected && !isShiftSchedule && (
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                فقط برای شیفت‌های چرخشی فعال است
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-borderL dark:border-borderD">
          <button
            onClick={handleDeletePattern}
            disabled={!isPatternSelected || isDeleting}
            className={getButtonStyle('danger', !isPatternSelected || isDeleting)}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">...</span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                حذف الگو
              </>
            )}
          </button>
        </div>
      </div>

      {/* مودال‌ها */}
      {selectedPatternId && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title={`حذف ${isShiftSchedule ? 'برنامه شیفتی' : 'الگوی کاری'}`}
          message={`آیا مطمئنید؟ این عملیات غیرقابل بازگشت است.`}
          confirmText={isDeleting ? 'در حال حذف...' : 'بله، حذف شود'}
          variant="danger"
          icon={<Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />}
        />
      )}

      {/* مودال تولید شیفت */}
      {selectedPatternId && isShiftSchedule && (
        <Dialog open={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)}>
          <GenerateShiftsForm
            shiftScheduleId={selectedPatternId}
            shiftScheduleName={selectedPatternName || ''}
            onClose={() => setIsGenerateModalOpen(false)}
          />
        </Dialog>
      )}
    </div>
  );
};