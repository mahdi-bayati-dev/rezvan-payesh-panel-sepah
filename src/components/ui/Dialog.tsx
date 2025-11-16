import React, { Fragment } from "react";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import clsx from "clsx";

// کامپوننت Transition برای Overlay (پس‌زمینه)
const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Transition.Child
    as={Fragment}
    enter="ease-out duration-300"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="ease-in duration-200"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
  >
    <div
      ref={ref}
      className={clsx(
        "fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity",
        className
      )}
      {...props}
    />
  </Transition.Child>
));
DialogOverlay.displayName = "DialogOverlay";

// کامپوننت اصلی Dialog (Wrapper)
const Dialog = HeadlessDialog;

// کامپوننت محتوای مودال (پنل اصلی)
const DialogContent = React.forwardRef<
  HTMLDivElement,
  {
    className?: string;
    children: React.ReactNode;
    onClose?: () => void; // پراپ برای دکمه بستن
  }
>(({ className, children, onClose, ...props }, ref) => (
  <Transition.Child
    as={Fragment}
    enter="ease-out duration-300"
    enterFrom="opacity-0 scale-95"
    enterTo="opacity-100 scale-100"
    leave="ease-in duration-200"
    leaveFrom="opacity-100 scale-100"
    leaveTo="opacity-0 scale-95"
  >
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <HeadlessDialog.Panel
          ref={ref}
          className={clsx(
            "relative w-full transform overflow-hidden rounded-2xl text-right shadow-xl transition-all",
            "bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD",
            className // کلاس‌های سفارشی (مثل max-w-3xl از ExportModal) اینجا اعمال می‌شوند
          )}
          {...props}
        >
          {children}
          {/* دکمه بستن (X) به صورت خودکار در گوشه بالا قرار می‌گیرد */}
          {onClose && (
            <button
              type="button"
              className="absolute top-3 left-3 p-1.5 text-muted-foregroundL dark:text-muted-foregroundD rounded-lg hover:bg-secondaryL dark:hover:bg-secondaryD"
              onClick={onClose}
            >
              <span className="sr-only">بستن</span>
              <X className="h-5 w-5" />
            </button>
          )}
        </HeadlessDialog.Panel>
      </div>
    </div>
  </Transition.Child>
));
DialogContent.displayName = "DialogContent";

// کامپوننت هدر
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx(
      "flex flex-col space-y-1.5 p-6 text-right",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

// کامپوننت فوتر
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx(
      "flex flex-col-reverse sm:flex-row sm:justify-start sm:space-x-2 sm:space-x-reverse p-6", // در فارسی، دکمه‌ها از چپ چین می‌شوند
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

// کامپوننت عنوان
const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <HeadlessDialog.Title
    ref={ref}
    as="h3"
    className={clsx(
      "text-lg font-semibold leading-none tracking-tight",
      "text-foregroundL dark:text-foregroundD",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

// کامپوننت توضیحات
const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <HeadlessDialog.Description
    ref={ref}
    as="p"
    className={clsx(
      "text-sm text-muted-foregroundL dark:text-muted-foregroundD",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

// اکسپورت کردن کامپوننت‌ها
export {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};