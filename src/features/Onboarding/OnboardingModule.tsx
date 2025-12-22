import { useEffect } from 'react';
import { useOnboarding } from './useOnboarding';
import "driver.js/dist/driver.css";

const OnboardingSystem = () => {
    const { startTour, driverInstance, currentPath } = useOnboarding();

    useEffect(() => {
        /**
         * منطق ترجمه متون داخلی driver.js
         * تبدیل "1 of 5" به "گام ۱ از ۵"
         */
        const translateTourElements = () => {
            // کست کردن به HTMLElement برای دسترسی به innerText و dataset
            const progressText = document.querySelector<HTMLElement>('.driver-popover-progress-text');

            if (progressText && !progressText.dataset.translated) {
                let text = progressText.innerText;

                // استفاده از _ برای متغیرهایی که استفاده نمی‌شوند و تایپ‌دهی صریح به پارامترها
                text = text.replace(/(\d+)\s+of\s+(\d+)/, (_match: string, current: string, total: string) => {
                    return `گام ${current} از ${total}`;
                });

                progressText.innerText = text;
                progressText.dataset.translated = "true"; // جلوگیری از تکرار در هر تیک Mutation
            }
        };

        // حذف آرگومان mutations چون از آن استفاده نمی‌کنیم (رفع خطای TS6133)
        const observer = new MutationObserver(() => {
            translateTourElements();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        const timer = setTimeout(() => {
            startTour(false);
        }, 1500);

        return () => {
            clearTimeout(timer);
            observer.disconnect(); // پاکسازی observer برای جلوگیری از Memory Leak
            if (driverInstance.current) {
                driverInstance.current.destroy();
            }
        };
    }, [startTour, currentPath, driverInstance]);

    return (
        <style>{`
            /* تنظیمات فونت و راست‌چین کردن */
            .driver-popover,
            .driver-popover * {
                font-family: 'Vazirmatn', sans-serif !important;
                direction: rtl !important;
                font-feature-settings: "ss01" !important; 
            }

            /* استایل‌های Glassmorphism و سفارشی‌سازی */
            .rezvan-onboarding-popover.driver-popover {
                background: rgba(255, 255, 255, 0.98) !important;
                backdrop-filter: blur(12px) !important;
                border-radius: 20px !important;
                padding: 30px 25px 22px 25px !important;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1) !important;
                border: 1px solid rgba(226, 232, 240, 0.8) !important;
                max-width: 500px !important;
            }

            .dark .rezvan-onboarding-popover.driver-popover {
                background: #1e293b !important;
                border-color: #334155 !important;
                color: #f8fafc !important;
            }

            /* دکمه بستن */
            .driver-popover-close-btn {
                top: 15px !important;
                right: 15px !important;
                left: auto !important;
                width: 30px !important;
                height: 30px !important;
                background: #f1f5f9 !important;
                border-radius: 50% !important;
                color: #64748b !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                border: none !important;
                font-size: 20px !important;
            }

            .driver-popover-close-btn:hover {
                background: #fee2e2 !important;
                color: #ef4444 !important;
                transform: rotate(90deg) !important;
            }

            .dark .driver-popover-close-btn {
                background: #334155 !important;
                color: #94a3b8 !important;
            }

            /* نشانگر پیشرفت */
            .driver-popover-progress-text {
                font-size: 12px !important;
                font-weight: 800 !important;
                color: #2563eb !important;
                background: #eff6ff !important;
                padding: 6px 14px !important;
                border-radius: 100px !important;
                border: 1px solid #dbeafe !important;
            }

            .dark .driver-popover-progress-text {
                background: rgba(37, 99, 235, 0.1) !important;
                color: #60a5fa !important;
                border-color: rgba(37, 99, 235, 0.2) !important;
            }

            /* فوتر و دکمه‌های ناوبری */
            .driver-popover-footer {
                margin-top: 25px !important;
                padding-top: 15px !important;
                border-top: 1px solid #f1f5f9 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
            }

            .dark .driver-popover-footer { border-top-color: #334155 !important; }

            .driver-popover-next-btn, 
            .driver-popover-prev-btn {
                border-radius: 12px !important;
                padding: 10px 20px !important;
                font-size: 13px !important;
                font-weight: 700 !important;
                transition: all 0.2s !important;
                border: none !important;
            }

            .driver-popover-next-btn {
                background: #2563eb !important;
                color: white !important;
                box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2) !important;
            }

            .driver-popover-prev-btn {
                background: #f1f5f9 !important;
                color: #475569 !important;
            }

            .dark .driver-popover-prev-btn {
                background: #334155 !important;
                color: #cbd5e1 !important;
            }

            .driver-popover-title {
                font-weight: 900 !important;
                font-size: 1.2rem !important;
                color: #0f172a !important;
                margin-top:1rem;
            }

            .driver-popover-description {
                font-size: 0.95rem !important;
                color: #475569 !important;
                line-height: 1.8 !important;
            }
            
            .dark .driver-popover-description { color: #94a3b8 !important; }
        `}</style>
    );
};

export default OnboardingSystem;