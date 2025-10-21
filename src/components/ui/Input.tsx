import { forwardRef, type InputHTMLAttributes } from "react";


type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string; // برای نمایش خطای اعتبارسنجی
    containerClassName?: string;
}


const Input = forwardRef<HTMLInputElement, InputProps>(({ label, name, error, containerClassName = '', className = '', ...props }, ref) => {
    // استایل‌های پایه بر اساس تم 
    const baseStyle = `
      w-full py-2.5 px-3 rounded-lg text-sm 
      bg-backgroundL-500 text-foregroundL 
      border border-borderL 
      focus:outline-none focus:ring-2 focus:ring-primaryL
      dark:bg-backgroundD dark:text-foregroundD
      dark:border-borderD dark:focus:ring-primaryD
      placeholder:text-muted-foregroundL
      dark:placeholder:text-muted-foregroundD
    `;

    // استایل در زمان خطا
    const errorStyle = error ? 'border-destructiveL dark:border-destructiveD focus:ring-destructiveL dark:focus:ring-destructiveD' : '';
    return (
        <>
            <div className={`w-full ${containerClassName}`}>
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-right mb-1 text-foregroundL dark:text-foregroundD"
                >
                    {label}
                </label>
                <input
                    id={name}
                    name={name}
                    ref={ref}
                    className={`${baseStyle} ${errorStyle} ${className}`.trim().replace(/\s+/g, ' ')}
                    {...props}
                />
                {/* نمایش پیام خطا در صورت وجود */}
                {error && (
                    <p className="mt-1 text-xs text-right text-destructiveL dark:text-destructiveD">
                        {error}
                    </p>
                )}
            </div>
        </>
    )

}
)
Input.displayName = 'Input';
export default Input;
