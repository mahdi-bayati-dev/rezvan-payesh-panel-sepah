import { Trash2, Edit, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeleteWeekPattern } from '@/features/work-pattern/hooks/useDeleteWeekPattern';
import { useState } from 'react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useDeleteShiftSchedule } from '@/features/shift-schedule/hooks/hook'; // ✅ هوک حذف شیفت

interface WorkPatternActionsProps {
  selectedPatternId: number | null;
  selectedPatternName: string | null;
  // ✅ پراپ جدید: برای تعیین نوع الگو (بر اساس محاسبه در useWorkPatternsHookGet)
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

  // ✅ تعیین هوک و وضعیت حذف فعال بر اساس نوع الگو
  const deleteMutation = isShiftSchedule ? deleteShiftSchedule : deleteWeekPattern;
  const isDeleting = isDeletingWeek || isDeletingShift;


  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isPatternSelected = selectedPatternId !== null;

  // --- مدیریت مسیرهای شرطی ---

  const handleEditPattern = () => {
    if (!isPatternSelected) return;

    if (isShiftSchedule) {
      // ✅ مسیر ویرایش برنامه شیفتی
      navigate(`/shift-schedules/edit/${selectedPatternId}`);
    } else {
      // ✅ مسیر ویرایش الگوی هفتگی ثابت
      navigate(`/work-patterns/edit/${selectedPatternId}`);
    }
  }

  const handleDeletePattern = () => {
    if (!isPatternSelected) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedPatternId) return;

    // ✅✅✅ راه‌حل (3b): استفاده از onSuccess و onError به جای onSettled
    // کامنت: این به ما کنترل بهتری می‌دهد. در صورت موفقیت، مودال را می‌بندیم.
    // در صورت خطا، مودال باز می‌ماند و toast خطا (از خود هوک) نمایش داده می‌شود.
    deleteMutation(selectedPatternId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        onActionComplete();
        // کامنت: toast موفقیت به صورت خودکار از useDeleteWeekPattern/useDeleteShiftSchedule می‌آید
      },
      onError: (error) => {
        // کامنت: toast خطا به صورت خودکار از هوک می‌آید
        // مودال باز می‌ماند تا کاربر خطا را ببیند
        console.error("Delete failed in WorkPatternActions:", error);
      }
    });
  };

  const handleViewEmployees = () => {
    if (selectedPatternId) {
      const patternType = isShiftSchedule ? 'schedule' : 'pattern';
      navigate(`/work-patterns/employees/${patternType}/${selectedPatternId}`);
    }
  }

  // --- سایر عملیات ---
  // const handleConfirm = () => console.log('تایید - (نیاز به تعریف کاربرد)');
  // const handleCancel = () => console.log('لغو - (نیاز به تعریف کاربرد)');

  // --- رندر ---
  return (
    <div className="p-3 bg-backgroundL-500 md:min-h-[350px] lg:min-h-[450px] rounded-lg shadow  flex flex-col justify-between dark:bg-backgroundD border border-borderL dark:border-borderD">
      {/* بخش دکمه‌های مربوط به الگو */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foregroundL dark:text-foregroundD">عملیات ها</h3>
        <ul className="space-y-2">
          {/* دکمه ویرایش (شرطی) */}
          <li>
            <button
              onClick={handleEditPattern}
              disabled={!isPatternSelected || isDeleting}
              className={`w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${isPatternSelected
                ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                }`}
            >
              <Edit size={16} />
              {/* ✅ متن دکمه واضح‌تر شد */}
              ویرایش الگو/شیفت
            </button>
          </li>
          <li>
            <button
              onClick={handleViewEmployees}
              disabled={!isPatternSelected || isDeleting}
              className={`w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${isPatternSelected
                // ✅ استایل دکمه تغییر کرد
                ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                }`}
            >
              <Users size={16} /> {/* ✅ آیکون تغییر کرد */}
              مدیریت کارمندان
            </button>
          </li>

          {/* دکمه حذف (شرطی) */}
          <li>
            <button
              onClick={handleDeletePattern}
              disabled={!isPatternSelected || isDeleting}
              className={`w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${isPatternSelected
                ? 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                }`}
            >
              {isDeleting ? 'در حال حذف...' : <Trash2 size={16} />}
              {/* ✅ متن دکمه واضح‌تر شد */}
              حذف الگو/شیفت
            </button>
          </li>

        </ul>
      </div>

      {/* بخش دکمه‌های تایید/لغو */}
      {/* <div className="flex justify-end gap-2 border-t border-borderL dark:border-borderD pt-3 mt-4">
        <button
          onClick={handleCancel}
          className="px-4 py-1.5 rounded-lg text-sm font-medium border border-borderL dark:border-borderD text-foregroundL dark:text-foregroundD hover:bg-secondaryL dark:hover:bg-secondaryD/80 transition-colors flex items-center"
        >
          <X size={16} className="ml-1" />
          لغو
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-1.5 rounded-lg bg-primaryL text-primary-foregroundL dark:bg-primaryD dark:text-primary-foregroundD hover:bg-primaryL/90 dark:hover:bg-primaryD/90 transition-colors text-sm font-medium flex items-center"
        >
          <Check size={16} className="ml-1" />
          تایید
        </button>
      </div> */}

      {/* مودال حذف */}
      {selectedPatternId && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title={`حذف ${isShiftSchedule ? 'برنامه شیفتی' : 'الگوی کاری'}`}
          message={`آیا مطمئنید که می‌خواهید ${isShiftSchedule ? 'برنامه شیفتی' : 'الگوی کاری'} "${selectedPatternName}" را برای همیشه حذف کنید؟ این عمل غیرقابل بازگشت است.`}
          confirmText={isDeleting ? 'در حال حذف...' : 'حذف کن'}
          variant="danger"
          icon={<Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />}
        />
      )}
    </div>
  );
};
