
// ۱. انواع ظاهری (variants) - بدون تغییر
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

// ۲. تعریف Props کامپوننت - بدون تغییر
interface BadgeProps {
    label: string;
    variant?: BadgeVariant;
    className?: string;
}


const variantClasses: Record<BadgeVariant, string> = {
    success:
        'bg-successL-background text-successL-foreground ' + // حالت روشن
        'dark:bg-successD-background dark:text-successD-foreground', // حالت تاریک

    warning:
        'bg-warningL-background text-warningL-foreground ' +
        'dark:bg-warningD-background dark:text-warningD-foreground',

    danger:
        'bg-destructiveL-background text-destructiveL-foreground ' +
        'dark:bg-destructiveD-background dark:text-destructiveD-foreground',

    info:
        'bg-infoL-background text-infoL-foreground ' +
        'dark:bg-infoD-background dark:text-infoD-foreground',

    default:
        'bg-secondaryL text-secondary-foregroundL ' +
        'dark:bg-secondaryD dark:text-secondary-foregroundD',
};


const Badge = ({ label, variant = 'default', className = '' }: BadgeProps) => {

    const classes = variantClasses[variant] || variantClasses.default;

    return (
        <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${classes} ${className}`}
        >
            {label}
        </span>
    );
};

export default Badge;