import { CirclePlus, Eye, SlidersHorizontal, Check, X } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// interface WorkPatternActionsProps {
//   selectedGroupId?: string | number | null;
//   onAssignToGroup?: () => void;
// }

export const WorkPatternActions = () => {
  // const navigate = useNavigate();

  const handleAddGroup = () => console.log('افزودن گروه کاری');
  const handleViewAssignments = () => console.log('مشاهده تخصیص الگو به گروه');
  const handleAssignShift = () => console.log('تخصیص اتوماتیک شیفت');
  const handleConfirm = () => console.log('تایید - (نیاز به تعریف کاربرد)');
  const handleCancel = () => console.log('لغو - (نیاز به تعریف کاربرد)');

  return (
    <div className="p-3 bg-backgroundL-500 md:min-h-[350px] lg:min-h-[450px] rounded-lg shadow  flex flex-col justify-between dark:bg-backgroundD">
      {/* بخش دکمه‌های مربوط به گروه‌ها */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foregroundL dark:text-foregroundD">عملیات ها</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={handleAddGroup}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primaryL text-primary-foregroundL cursor-pointer dark:bg-primaryD dark:text-primary-foregroundD hover:bg-primaryL/90 dark:hover:bg-primaryD/90 transition-colors text-sm font-medium"
            >
              <CirclePlus size={16} />
              افزودن گروه کاری
            </button>
          </li>
          <li>
            <button
              onClick={handleViewAssignments}
              className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primaryL text-primary-foregroundL cursor-pointer dark:bg-secondaryD dark:text-foregroundD hover:bg-primaryL/90 dark:hover:bg-secondaryD/80 transition-colors text-xs"
            >
              <Eye size={16} />
              مشاهده کاربران زیرمجموعه
            </button>
          </li>
          <li>
            <button
              onClick={handleAssignShift}
              className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primaryL text-primary-foregroundL cursor-pointer dark:bg-secondaryD dark:text-foregroundD hover:bg-primaryL/90 dark:hover:bg-secondaryD/80 transition-colors text-xs"
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
    </div>
  );
};