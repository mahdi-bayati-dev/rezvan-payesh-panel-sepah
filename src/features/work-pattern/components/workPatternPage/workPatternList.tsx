import { useState } from 'react';
import { Search, CirclePlus, Repeat2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/ui/Input';
import { WorkPatternListSkeleton } from '@/features/work-pattern/Skeleton/WorkPatternListSkeleton';

import { type WorkPatternUI } from '@/features/work-pattern/types/index';
import clsx from 'clsx';

interface WorkPatternListProps {
  patterns: WorkPatternUI[];
  selectedPatternKey: string | null;
  onSelectPattern: (key: string | null) => void;
  isLoading?: boolean;
}

export const WorkPatternList = ({
  patterns,
  selectedPatternKey,
  onSelectPattern,
  isLoading = false,
}: WorkPatternListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredPatterns = patterns.filter(pattern =>
    pattern.name.toLowerCase().includes(searchTerm.toLowerCase())
  );



  const handleAddNewPattern = () => {
    navigate('/work-patterns/new-work-patterns');
  };

  return (
    <div className="flex flex-col h-full p-4 bg-backgroundL-500 rounded-lg shadow dark:bg-backgroundD border border-borderL dark:border-borderD">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foregroundL dark:text-foregroundD">الگوهای کاری و شیفتی</h3>
        <button
          aria-label='اضاغه کردن الگو'
          onClick={handleAddNewPattern}
          className="p-1.5 rounded-md flex items-center gap-1 text-white bg-primaryL dark:text-primaryD hover:bg-blue-600 cursor-pointer dark:hover:bg-blue-600 cursor-pointe transition-colors text-xs"
          title="افزودن الگوی کاری جدید"
        >
          <CirclePlus size={20} />
          ایجاد الگو
        </button>
      </div>

      <div className="relative mb-4">
        <Input
          label=''
          type="text"
          placeholder="جستجو در الگوها و شیفت‌ها"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-10 pl-3 py-2 text-sm bg-backgroundL-500 text-foregroundL dark:text-foregroundD border border-borderL dark:border-borderD rounded-lg focus:ring-2 focus:ring-primaryL dark:focus:ring-primaryD"
        />
        <Search
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL dark:text-muted-foregroundD pointer-events-none"
        />
      </div>
      {/* رندر ایتم ها */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <WorkPatternListSkeleton rowCount={12} />
        ) : filteredPatterns.length === 0 ? (
          <p className="text-center text-muted-foregroundL dark:text-muted-foregroundD pt-10">هیچ الگو یا برنامه شیفتی یافت نشد.</p>
        ) : (
          <ul className="space-y-2">
            {filteredPatterns.map((pattern) => {
              // ✅ تعیین آیکون و تگ بر اساس نوع
              const isShift = pattern.pattern_type === 'SHIFT_SCHEDULE';
              const Icon = isShift ? Repeat2 : Calendar;
              const tagText = isShift ? 'شیفتی' : 'هفتگی';
              const tagClass = isShift
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';

              // ✅ ۳. ساخت کلید ترکیبی منحصربفرد
              const compositeKey = `${pattern.pattern_type}-${pattern.id}`;

              return (
                <li key={compositeKey}> {/* ✅ استفاده از کلید ترکیبی برای key */}
                  <button
                    // ✅ ۴. ارسال کلید ترکیبی به تابع پدر
                    onClick={() => onSelectPattern(compositeKey)}
                    className={clsx(
                      "w-full text-right p-3 rounded-md transition-colors text-sm border-b border-borderL dark:border-borderD flex items-center justify-between",
                      // ✅ ۵. بررسی انتخاب بر اساس کلید ترکیبی
                      selectedPatternKey === compositeKey
                        ? 'bg-primaryL text-primary-foregroundL dark:bg-primaryD dark:text-primary-foregroundD font-medium shadow'
                        : 'hover:bg-secondaryL dark:hover:bg-secondaryD text-foregroundL dark:text-foregroundD'
                    )}
                  >
                    <div className='flex items-center gap-2 min-w-0'> {/* ✅ min-w-0 برای truncate */}
                      <Icon size={16} className='shrink-0' />
                      <span className="truncate">{pattern.name}</span>
                    </div>
                    <span className={clsx("text-xs px-2 py-0.5 rounded-full shrink-0 ml-2", tagClass)}>
                      {tagText}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

