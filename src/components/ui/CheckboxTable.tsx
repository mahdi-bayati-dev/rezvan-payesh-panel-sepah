import * as React from "react"
// کامنت: ایمپورت Checkbox از headlessui
import { Checkbox as HeadlessCheckbox } from "@headlessui/react"
// کامنت: ایمپورت آیکون Minus برای حالت indeterminate
import { Check, Minus } from "lucide-react"
import clsx from "clsx"

// کامنت: این اینترفیس را برای مپ کردن پراپ‌های Radix به Headless UI تعریف می‌کنیم
interface CustomCheckboxProps {
    checked?: boolean | 'indeterminate';
    onCheckedChange?: (checked: boolean) => void; // Radix می‌توانست 'indeterminate' هم برگرداند، اما Headless UI فقط boolean برمی‌گرداند
    label?: string;
    id?: string;
    className?: string;
    disabled?: boolean;
}

// کامپوننت چک‌باکس بر اساس Headless UI، اما با پراپ‌های سازگار با Radix
const Checkbox = React.forwardRef<
    HTMLButtonElement, // Headless Checkbox به عنوان <button> رندر می‌شود
    CustomCheckboxProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'checked'> // پراپ‌های نیتیو دکمه را هم می‌پذیریم
>(({ className, label, id, checked, onCheckedChange, ...props }, ref) => {

    const isIndeterminate = checked === 'indeterminate';
    const isChecked = checked === true;

    return (
        <div className="flex items-center space-x-2 space-x-reverse">
            <HeadlessCheckbox
                ref={ref}
                id={id}
                checked={isChecked} // Headless فقط boolean می‌پذیرد
                onChange={(value: boolean) => {
                    // onCheckedChange را با مقدار boolean فراخوانی می‌کنیم
                    onCheckedChange?.(value);
                }}
                // کامنت: برای حالت indeterminate از data attribute سفارشی استفاده می‌کنیم
                data-indeterminate={isIndeterminate}
                className={clsx(
                    // استایل‌های پایه جعبه
                    "peer h-4 w-4 shrink-0 rounded-sm border border-borderL dark:border-borderD ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",

                    // استایل‌های حالت checked با data-checked
                    "data-[checked]:bg-primaryL data-[checked]:text-primary-foregroundL dark:data-[checked]:bg-primaryD dark:data-[checked]:text-primary-foregroundD",

                    // استایل‌های حالت indeterminate با data-indeterminate
                    "data-[indeterminate]:bg-primaryL data-[indeterminate]:text-primary-foregroundL dark:data-[indeterminate]:bg-primaryD dark:data-[indeterminate]:text-primary-foregroundD",

                    // کلاس‌های سفارشی
                    "flex items-center justify-center", // برای وسط‌چین کردن آیکون
                    className
                )}
                {...props} // ...props را اینجا پاس می‌دهیم (مثل disabled)
            >
                {/* کامنت: استفاده از render prop برای دسترسی به state */}
                {({ checked: headlessChecked }) => (
                    <>
                        {/* آیکون خط تیره برای حالت indeterminate */}
                        <Minus className={clsx(
                            "h-4 w-4 text-current transition-opacity",
                            isIndeterminate ? "opacity-100" : "opacity-0"
                        )} />

                        {/* آیکون تیک برای حالت checked */}
                        <Check className={clsx(
                            "h-10 w-22 text-current transition-opacity",
                            // کامنت: فقط زمانی تیک را نشان بده که checked=true باشد و indeterminate نباشد
                            (headlessChecked && !isIndeterminate) ? "opacity-100" : "opacity-0"
                        )} />
                    </>
                )}
            </HeadlessCheckbox>
            {label && (
                <label
                    htmlFor={id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foregroundL dark:text-foregroundD"
                >
                    {label}
                </label>
            )}
        </div>
    )
})

Checkbox.displayName = "Checkbox"

export default Checkbox

