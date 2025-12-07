import { useState } from 'react';
import { Search, CirclePlus, Repeat2, Calendar, UserPlus, FilterX, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/ui/Input';
import { WorkPatternListSkeleton } from '@/features/work-pattern/Skeleton/WorkPatternListSkeleton';
import { type WorkPatternUI } from '@/features/work-pattern/types/index';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
// ✅ ایمپورت تابع تبدیل اعداد
// import { toPersianDigits } from '@/features/work-pattern/utils/persianUtils';

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

  return (
    <div className="flex flex-col h-full bg-backgroundL-500 dark:bg-backgroundD">
      {/* --- هدر لیست (چسبنده) --- */}
      <div className="sticky top-0 z-10 bg-backgroundL-500/95 dark:bg-backgroundD/95 backdrop-blur-md p-4 border-b border-borderL dark:border-borderD space-y-3">

        {/* ردیف دکمه‌ها و عنوان */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-muted-foregroundL" />
            لیست الگوها

          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/work-patterns/assign')}
              className="h-8 text-xs px-2 gap-1.5 border-dashed hover:bg-primaryL/5 hover:text-primaryL dark:hover:text-primaryD transition-colors"
              title="تخصیص به کاربران"
            >
              <UserPlus size={14} />
              تخصیص
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/work-patterns/new-work-patterns')}
              className="h-8 text-xs px-2 gap-1.5 shadow-sm shadow-primaryL/20"
            >
              <CirclePlus size={14} />
              جدید
            </Button>
          </div>
        </div>

        {/* فیلد جستجو */}
        <div className="relative group">
          <Input
            label=''
            placeholder="جستجو در نام الگو..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 text-sm pr-9 bg-secondaryL/30 dark:bg-secondaryD/30 border-transparent focus:bg-backgroundL-500 dark:focus:bg-backgroundD transition-all group-hover:bg-secondaryL/50 dark:group-hover:bg-secondaryD/50"
          />
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foregroundL group-hover:text-foregroundL transition-colors"
          />
        </div>
      </div>

      {/* --- محتوای لیست --- */}
      <div className="flex-1 overflow-y-auto p-2 scroll-smooth custom-scrollbar">
        {isLoading ? (
          <WorkPatternListSkeleton rowCount={8} />
        ) : filteredPatterns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foregroundL opacity-60">
            <FilterX className="w-10 h-10 mb-2 stroke-1" />
            <p className="text-xs">هیچ الگویی یافت نشد.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredPatterns.map((pattern) => {
              const isShift = pattern.pattern_type === 'SHIFT_SCHEDULE';
              const compositeKey = `${pattern.pattern_type}-${pattern.id}`;
              const isSelected = selectedPatternKey === compositeKey;

              return (
                <li key={compositeKey} >
                  <button
                    onClick={() => onSelectPattern(compositeKey)}
                    className={clsx(
                      "group w-full text-right p-3 rounded-xl transition-all duration-200 border flex items-center justify-between relative overflow-hidden cursor-pointer",
                      // --- استایل‌های اصلی و دارک مود ---
                      isSelected
                        ? "bg-primaryL/5 border-primaryL/60 dark:bg-primaryD/10 dark:border-primaryD/40 shadow-sm ring-1 ring-primaryL/10 dark:ring-primaryD/10"
                        : "bg-backgroundL-500 dark:bg-backgroundD border-transparent hover:bg-secondaryL/60 dark:hover:bg-white/[0.04] hover:border-borderL/50 dark:hover:border-white/10"
                    )}
                  >
                    {/* نوار نشانگر انتخاب (سمت راست) */}
                    {isSelected && (
                      <div className="absolute right-0 top-3 bottom-3 w-1 bg-primaryL dark:bg-primaryD rounded-l-full" />
                    )}

                    <div className="flex items-center gap-3 min-w-0 pl-2">
                      {/* آیکون الگو */}
                      <div className={clsx(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors border",
                        isSelected
                          ? "bg-primaryL text-white border-primaryL dark:bg-primaryD dark:text-backgroundD dark:border-primaryD"
                          : "bg-secondaryL/50 dark:bg-secondaryD/50 border-borderL dark:border-borderD text-muted-foregroundL dark:text-muted-foregroundD group-hover:bg-white dark:group-hover:bg-white/10"
                      )}>
                        {isShift ? <Repeat2 size={16} /> : <Calendar size={16} />}
                      </div>

                      {/* نام و توضیحات */}
                      <div className="flex flex-col min-w-0 gap-0.5">
                        <span className={clsx(
                          "text-sm font-semibold truncate transition-colors",
                          isSelected
                            ? "text-primaryL dark:text-primaryD"
                            : "text-foregroundL dark:text-stone-300 group-hover:text-foregroundL dark:group-hover:text-white"
                        )}>
                          {pattern.name}
                        </span>
                        <span className="text-[11px] text-muted-foregroundL dark:text-muted-foregroundD/70 truncate">
                          {pattern.organizationName || (isShift ? 'برنامه چرخشی' : 'الگوی هفتگی')}
                        </span>
                      </div>
                    </div>

                    {/* --- بج‌ها (Badges) --- */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {isShift ? (
                        // بج برای شیفت
                        <span className="inline-flex flex-col items-center px-2  py-0.5 rounded-md text-xs bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                          <div>
                            شیفتی
                          </div>
                          <div>
                            {/* ✅ تبدیل عدد طول دوره به فارسی */}
                            {/* <span className=" font-bold">{toPersianDigits(pattern.cycle_length_days)}</span> روزه */}
                          </div>
                        </span>
                      ) : (
                        // بج برای ثابت
                        <span className="inline-flex items-center px-2  py-0.5 rounded-md text-xs  bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30">
                          ثابت
                        </span>
                      )}
                    </div>
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