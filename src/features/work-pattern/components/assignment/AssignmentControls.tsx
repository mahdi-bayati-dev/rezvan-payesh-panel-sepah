import { Search, Users, Briefcase } from 'lucide-react';
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox";
import Input from "@/components/ui/Input";
import clsx from 'clsx';
import { toPersianDigits } from '@/features/work-pattern/utils/persianUtils';
import { type AssignmentTab, type PatternSelectOption } from '@/features/work-pattern/hooks/logic/useAssignmentLogic';

interface AssignmentControlsProps {
    selectedPattern: PatternSelectOption | null;
    onPatternSelect: (option: SelectOption) => void;
    patternOptions: PatternSelectOption[];
    searchQuery: string;
    onSearchChange: (val: string) => void;
    activeTab: AssignmentTab;
    onTabChange: (tab: AssignmentTab) => void;
    employeesCount: number;
    groupsCount: number;
    isLoading: boolean;
}

export const AssignmentControls = ({
    selectedPattern,
    onPatternSelect,
    patternOptions,
    searchQuery,
    onSearchChange,
    activeTab,
    onTabChange,
    employeesCount,
    groupsCount,
    isLoading
}: AssignmentControlsProps) => {
    return (
        <div className="space-y-6">
            {/* بخش انتخاب الگو و جستجو */}
            {/* بهبود: استفاده از رنگ تیره تر در دارک مود برای باکس فیلترها */}
            <div className="bg-backgroundL-500 dark:bg-secondaryD/10 p-5 rounded-2xl border border-borderL dark:border-white/5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                    <div className="md:col-span-4">
                        <SelectBox
                            label="۱. انتخاب الگوی کاری یا شیفت"
                            placeholder="یک الگو را انتخاب کنید..."
                            options={patternOptions}
                            value={selectedPattern}
                            onChange={onPatternSelect}
                            disabled={isLoading}
                            className="dark:bg-backgroundD"
                        />
                    </div>
                    <div className="md:col-span-8">
                        <Input
                            label={`۲. جستجو در ${activeTab === 'EMPLOYEES' ? 'کارمندان' : 'گروه‌های کاری'}`}
                            placeholder="نام، کد پرسنلی یا عنوان..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            icon={<Search className="h-4 w-4 text-muted-foregroundL dark:text-muted-foregroundD" />}
                            className="bg-white dark:bg-backgroundD dark:border-white/10"
                        />
                    </div>
                </div>
            </div>

            {/* تب‌ها */}
            {/* بهبود: استایل مدرن‌تر برای تب‌ها در دارک مود */}
            <div className="flex space-x-1 rounded-xl bg-secondaryL/20 dark:bg-black/30 p-1.5 rtl:space-x-reverse border border-transparent dark:border-white/5">
                <TabButton
                    isActive={activeTab === 'EMPLOYEES'}
                    onClick={() => onTabChange('EMPLOYEES')}
                    icon={<Users className="h-4 w-4" />}
                    label="کارمندان"
                    count={employeesCount}
                />
                <TabButton
                    isActive={activeTab === 'WORK_GROUPS'}
                    onClick={() => onTabChange('WORK_GROUPS')}
                    icon={<Briefcase className="h-4 w-4" />}
                    label="گروه‌های کاری"
                    count={groupsCount}
                />
            </div>
        </div>
    );
};

// دکمه تب داخلی با استایل بهبود یافته
const TabButton = ({ isActive, onClick, icon, label, count }: any) => (
    <button
        onClick={onClick}
        className={clsx(
            "w-full rounded-lg py-2.5 text-sm font-medium transition-all duration-200",
            "flex items-center justify-center gap-2",
            isActive
                // استایل تب فعال: در دارک مود از رنگ پس‌زمینه اصلی با بوردر نازک استفاده می‌کنیم
                ? "bg-white dark:bg-backgroundD shadow-sm text-primaryL dark:text-primaryD ring-1 ring-black/5 dark:ring-white/10 dark:shadow-none"
                // استایل تب غیرفعال
                : "text-muted-foregroundL dark:text-muted-foregroundD hover:bg-white/50 dark:hover:bg-white/5 hover:text-foregroundL dark:hover:text-foregroundD"
        )}
    >
        {icon}
        <span>{label}</span>
        <span className={clsx(
            "px-2 py-0.5 rounded-full text-[11px] font-bold min-w-[20px]", 
            isActive 
                ? "bg-primaryL/10 text-primaryL dark:bg-primaryD/10 dark:text-primaryD" 
                : "bg-black/5 text-muted-foregroundL dark:bg-white/10 dark:text-muted-foregroundD"
        )}>
            {toPersianDigits(count)}
        </span>
    </button>
);