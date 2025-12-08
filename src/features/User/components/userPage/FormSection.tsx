import React from 'react';
import { Button } from '@/components/ui/Button';
import { Edit, Save, X, Loader2 } from 'lucide-react';

/**
 * کامپوننت Wrapper برای هر بخش فرم (جهت تکرار نکردن UI)
 * شامل هدر، دکمه ویرایش/ذخیره/لغو و fieldset
 */
const FormSection: React.FC<{
    title: string;
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
    onCancel: () => void;
    isDirty: boolean;
    isSubmitting: boolean;
}> = ({ title, children, onSubmit, isEditing, setIsEditing, onCancel, isDirty, isSubmitting }) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* هدر فرم و دکمه ویرایش */}
            <div className="flex justify-between items-center pb-4 border-b border-borderL dark:border-borderD">
                <h3 className="text-lg font-bold dark:text-backgroundL-500">{title}</h3>
                {!isEditing ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 ml-2" />
                        ویرایش
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button type="submit" variant="primary" size="sm" disabled={!isDirty || isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 ml-2" />}
                            ذخیره
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
                            <X className="h-4 w-4 ml-2" />
                            لغو
                        </Button>
                    </div>
                )}
            </div>

            {/* فیلدهای فرم */}
            {/* ما از fieldset استفاده می‌کنیم تا وقتی `disabled` است،
                تمام Input ها و Select های داخل آن به صورت خودکار غیرفعال شوند.
            */}
            <fieldset disabled={!isEditing || isSubmitting} className="space-y-4">
                {children}
            </fieldset>
        </form>
    );
};

export default FormSection;
