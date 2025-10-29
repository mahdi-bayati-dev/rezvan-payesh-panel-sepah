import { useState } from 'react';
import { Search, CirclePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/ui/Input';

import { type WorkPatternUI } from '@/features/work-pattern/types/index';

interface WorkPatternListProps {
  // ✅ ۲. استفاده از تایپ صحیح در پراپ‌ها
  patterns: WorkPatternUI[];
  selectedPatternId: string | number | null;
  onSelectPattern: (id: string | number) => void;
  isLoading?: boolean;
}

export const WorkPatternList = ({
  patterns,
  selectedPatternId,
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
        <h3 className="text-lg font-semibold text-foregroundL dark:text-foregroundD">الگوهای کاری</h3>
        <button
          aria-label='اضاغه کردن الگو'
          onClick={handleAddNewPattern}
          className="p-1.5 rounded-md text-backgroundL-500 bg-primaryL dark:text-primaryD hover:bg-blue cursor-pointer dark:hover:bg-blue transition-colors"
          title="افزودن الگوی کاری جدید"
        >
          <CirclePlus size={20} />
        </button>
      </div>
      {/* جست و جو   */}
      <div className="relative mb-4">
        <Input
          label=''
          type="text"
          placeholder="جستجو در  الگو ها"
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
          <p className="text-center text-muted-foregroundL dark:text-muted-foregroundD pt-10">در حال بارگذاری...</p>
        ) : filteredPatterns.length === 0 ? (
          <p className="text-center text-muted-foregroundL dark:text-muted-foregroundD pt-10">هیچ الگویی یافت نشد.</p>
        ) : (
          <ul className="space-y-2">
            {filteredPatterns.map((pattern) => (
              <li key={pattern.id}>
                <button
                  onClick={() => onSelectPattern(pattern.id)}
                  className={`w-full text-right p-2 rounded-md transition-colors text-sm border-b border-borderL dark:border-borderD ${selectedPatternId === pattern.id
                    ? 'bg-primaryL text-primary-foregroundL dark:bg-primaryD dark:text-primary-foregroundD font-medium shadow'
                    : 'hover:bg-secondaryL dark:hover:bg-secondaryD text-foregroundL dark:text-foregroundD'
                    }`}
                >
                  {pattern.name}
                  {/* <span className="text-xs text-muted-foregroundL  dark:text-muted-foregroundD mr-2 block mt-1">
                    ({pattern.organization_name})
                  </span> */}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};