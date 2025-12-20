// Alert.tsx
import React from 'react';
import clsx from 'clsx';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'destructive';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: AlertVariant;
}

const variantConfig: Record<AlertVariant, { icon: React.ReactNode; classes: string }> = {
    info: {
        icon: <Info className="h-4 w-4" />,
        classes: 'border-blue-500/50 text-blue-700 [&>svg]:text-blue-700 dark:border-blue-500/[.3] dark:text-blue-400 dark:[&>svg]:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
    },
    success: {
        icon: <CheckCircle className="h-4 w-4" />,
        classes: 'border-green-500/50 text-green-700 [&>svg]:text-green-700 dark:border-green-500/[.3] dark:text-green-400 dark:[&>svg]:text-green-400 bg-green-50 dark:bg-green-900/30',
    },
    warning: {
        icon: <AlertTriangle className="h-4 w-4" />,
        classes: 'border-yellow-500/50 text-yellow-700 [&>svg]:text-yellow-700 dark:border-yellow-500/[.3] dark:text-yellow-400 dark:[&>svg]:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30',
    },
    destructive: {
        icon: <XCircle className="h-4 w-4" />,
        classes: 'border-red-500/50 text-red-700 [&>svg]:text-red-700 dark:border-red-500/[.3] dark:text-red-400 dark:[&>svg]:text-red-400 bg-red-50 dark:bg-red-900/30',
    },
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = 'info', children, ...props }, ref) => {
        const config = variantConfig[variant];
        return (
            <div
                ref={ref}
                role="alert"
                className={clsx(
                    'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
                    config.classes,
                    className
                )}
                {...props}
            >
                {config.icon}
                <div className="flex flex-col">
                    {children}
                </div>
            </div>
        );
    }
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, children, ...props }, ref) => (
        <h5
            ref={ref}
            className={clsx('mb-1 font-medium leading-none tracking-tight text-right', className)}
            {...props}
        >
            {children}
        </h5>
    )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={clsx('text-sm [&_p]:leading-relaxed text-right', className)}
            {...props}
        >
            {children}
            <br />
            <span className="text-[10px] opacity-70">
                لطفا صفحه را رفرش کنید یا شبکه ای خود را بررسی کنید
            </span>
        </div>
    )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };