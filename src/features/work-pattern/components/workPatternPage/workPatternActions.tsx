import { CirclePlus, Eye, SlidersHorizontal, Check, X, Trash2, Edit } from 'lucide-react';
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
}


export const WorkPatternActions = ({
  selectedPatternId,
  selectedPatternName,
  isShiftSchedule = false,
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
    deleteMutation(selectedPatternId, {
      onSettled: () => setIsDeleteModalOpen(false)
    });
  };

  const handleViewEmployees = () => {
    if (selectedPatternId) {
      // ✅ مسیر مشاهده کاربران برای هر دو نوع الگو یکی است (فیلتر بر اساس work_pattern_id)
      navigate(`/work-patterns/employees/${selectedPatternId}`);
    }
  }

  // --- سایر عملیات ---
  const handleAddGroup = () => navigate("/work-patterns/add-to-work-pattern");
  const handleAssignShift = () => console.log('تخصیص اتوماتیک شیفت');
  const handleConfirm = () => console.log('تایید - (نیاز به تعریف کاربرد)');
  const handleCancel = () => console.log('لغو - (نیاز به تعریف کاربرد)');

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
              ویرایش الگوی منتخب
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
              حذف الگوی منتخب
            </button>
          </li>

          {/* دکمه تخصیص کاربر */}
          <li>
            <button
              onClick={handleAddGroup}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-primaryL text-primary-foregroundL cursor-pointer dark:bg-primaryD dark:text-primary-foregroundD hover:bg-primaryL/90 dark:hover:bg-primaryD/90 transition-colors text-xs font-medium"
            >
              <CirclePlus size={16} />
              افزودن کاربر / گروه کاری
            </button>
          </li>

          {/* دکمه‌های گزارش و اتوماسیون */}
          <li>
            <button
              onClick={handleViewEmployees}
              className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-secondaryL dark:bg-secondaryD dark:text-foregroundD text-foregroundL hover:bg-secondaryL/80 transition-colors text-xs"
            >
              <Eye size={16} />
              مشاهده کاربران زیرمجموعه
            </button>
          </li>
          <li>
            <button
              onClick={handleAssignShift}
              className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-secondaryL dark:bg-secondaryD dark:text-foregroundD text-foregroundL hover:bg-secondaryL/80 transition-colors text-xs"
            >
              <SlidersHorizontal size={16} />
              تخصیص اتوماتیک شیفت
            </button>
          </li>
        </ul>
      </div>

      {/* بخش دکمه‌های تایید/لغو */}
      <div className="flex justify-end gap-2 border-t border-borderL dark:border-borderD pt-3 mt-4">
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
      </div>

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
