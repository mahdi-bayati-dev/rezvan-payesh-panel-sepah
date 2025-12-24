import { Trash2, Edit, Users, Cpu, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeleteWeekPattern } from '@/features/work-pattern/hooks/api/useDeleteWeekPattern';
import { useState } from 'react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useDeleteShiftSchedule } from '@/features/shift-schedule/hooks/hook';
// ❌ حذف Dialog اضافه، چون GenerateShiftsForm خودش Modal داخلی دارد
// import { Dialog } from '@/components/ui/Dialog';
import { GenerateShiftsForm } from '@/features/shift-schedule/components/GenerateShiftsForm';
import { Button } from '@/components/ui/Button';

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

  const { mutate: deleteWeekPattern, isPending: isDeletingWeek } = useDeleteWeekPattern();
  const { mutate: deleteShiftSchedule, isPending: isDeletingShift } = useDeleteShiftSchedule();

  const deleteMutation = isShiftSchedule ? deleteShiftSchedule : deleteWeekPattern;
  const isDeleting = isDeletingWeek || isDeletingShift;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const isPatternSelected = selectedPatternId !== null;

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
        setIsDeleteModalOpen(false);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 h-full">

      <div className="p-4 bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-sm flex flex-col gap-4 h-full">

        {/* Header */}
        <div className="pb-3 border-b border-borderL dark:border-borderD">
          <h3 className="text-sm font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primaryL dark:text-primaryD" />
            عملیات
          </h3>
          <p className="text-[11px] text-muted-foregroundL dark:text-muted-foregroundD mt-1 line-clamp-2 h-8">
            {isPatternSelected
              ? `الگوی «${selectedPatternName}» انتخاب شده است.`
              : "جهت فعال شدن گزینه‌ها، یک الگو را انتخاب کنید."}
          </p>
        </div>

        {/* Action Buttons List */}
        <div className="flex flex-col gap-2 flex-1">

          <Button
            variant="outline"
            onClick={() => isShiftSchedule ? navigate(`/shift-schedules/edit/${selectedPatternId}`) : navigate(`/work-patterns/edit/${selectedPatternId}`)}
            disabled={!isPatternSelected || isDeleting}
            className="justify-start h-10 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            <Edit className="w-4 h-4 ml-2" />
            ویرایش الگو
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(`/work-patterns/employees/${isShiftSchedule ? 'schedule' : 'pattern'}/${selectedPatternId}`)}
            disabled={!isPatternSelected || isDeleting}
            className="justify-start h-10 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
          >
            <Users className="w-4 h-4 ml-2 " />
            مدیریت سربازان
          </Button>

          {isShiftSchedule && (
            <Button
              variant="primary"
              onClick={() => setIsGenerateModalOpen(true)}
              disabled={!isPatternSelected || isDeleting}
              className="justify-start h-10 bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20 shadow-md mt-2"
            >
              <Cpu className="w-4 h-4 ml-2" />
              تولید شیفت‌ها
            </Button>
          )}

        </div>

        {/* Delete Button (Bottom) */}
        <div className="pt-3 border-t border-borderL dark:border-borderD mt-auto">
          <Button
            variant="ghost"
            onClick={handleDeletePattern}
            disabled={!isPatternSelected || isDeleting}
            className="w-full justify-start h-10 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/20 px-2"
          >
            {isDeleting ? <span className="animate-pulse">در حال حذف...</span> : (
              <>
                <Trash2 className="w-4 h-4 ml-2" />
                حذف این الگو
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modals */}
      {selectedPatternId && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="حذف الگو"
          message={`آیا از حذف «${selectedPatternName}» مطمئن هستید؟ این عملیات غیرقابل بازگشت است.`}
          confirmText="بله، حذف کن"
          variant="danger"
          isLoading={isDeleting}
        />
      )}

      {/* ✅ اصلاح شده: GenerateShiftsForm مستقیماً رندر می‌شود و isOpen را دریافت می‌کند */}
      {selectedPatternId && isShiftSchedule && (
        <GenerateShiftsForm
          isOpen={isGenerateModalOpen}
          shiftScheduleId={selectedPatternId}
          shiftScheduleName={selectedPatternName || ''}
          onClose={() => setIsGenerateModalOpen(false)}
        />
      )}
    </div>
  );
};