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
            <div className="bg-backgroundL-500 dark:bg-backgroundD/50 p-4 rounded-xl border border-borderL dark:border-borderD shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4">
                        <SelectBox
                            label="۱. انتخاب الگوی کاری یا شیفت"
                            placeholder="یک الگو را انتخاب کنید..."
                            options={patternOptions}
                            value={selectedPattern}
                            onChange={onPatternSelect}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="md:col-span-8">
                        <Input
                            label={`۲. جستجو در ${activeTab === 'EMPLOYEES' ? 'کارمندان' : 'گروه‌های کاری'}`}
                            placeholder="نام، کد پرسنلی یا عنوان..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            icon={<Search className="h-4 w-4 text-muted-foregroundL" />}
                            className="bg-white dark:bg-backgroundD"
                        />
                    </div>
                </div>
            </div>

            {/* تب‌ها */}
            <div className="flex space-x-1 rounded-xl bg-secondaryL/20 dark:bg-secondaryD/20 p-1 rtl:space-x-reverse">
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

// دکمه تب داخلی
const TabButton = ({ isActive, onClick, icon, label, count }: any) => (
    <button
        onClick={onClick}
        className={clsx(
            "w-full rounded-lg py-3 text-sm font-medium transition-all duration-200",
            "flex items-center justify-center gap-2",
            isActive
                ? "bg-white dark:bg-gray-700 shadow-sm text-primaryL ring-1 ring-black/5 dark:ring-white/10"
                : "text-muted-foregroundL hover:bg-white/50 dark:hover:bg-white/5"
        )}
    >
        {icon}
        <span>{label}</span>
        <span className={clsx("px-2 py-0.5 rounded-full text-xs", isActive ? "bg-primaryL/10" : "bg-black/5 dark:bg-white/10")}>
            {toPersianDigits(count)}
        </span>
    </button>
);