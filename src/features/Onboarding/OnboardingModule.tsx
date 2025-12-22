import React, { useEffect } from 'react';
import { useOnboarding } from './useOnboarding';
import "driver.js/dist/driver.css";


const OnboardingSystem: React.FC = () => {
    const { startTour, driverInstance, currentPath } = useOnboarding();

    useEffect(() => {
        const timer = setTimeout(() => {
            startTour(false);
        }, 1500);

        return () => {
            clearTimeout(timer);
            if (driverInstance.current) {
                driverInstance.current.destroy();
            }
        };
    }, [startTour, currentPath]);

    return (
        <style>{`
            /* قانون کلی و قوی برای اعمال فونت به تمام اجزای popover */
            .driver-popover,
            .driver-popover * {
                font-family: 'Vazirmatn', sans-serif !important;
                direction: rtl !important;
            }

            /* محفظه اصلی پاپ‌اور */
            .rezvan-onboarding-popover,
            .driver-popover {
                background: rgba(255, 255, 255, 0.95) !important;
                backdrop-filter: blur(10px) !important;
                border-radius: 24px !important;
                padding: 28px !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                max-width: 800px !important;
                animation: rezvan-fade-in 0.3s ease-out !important;
            }

            .dark .rezvan-onboarding-popover,
            .dark .driver-popover {
                background: rgba(15, 23, 42, 0.9) !important;
                color: #f8fafc !important;
                border: 1px solid rgba(51, 65, 85, 0.5) !important;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
            }

            @keyframes rezvan-fade-in {
                from { opacity: 0; transform: translateY(10px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            /* عنوان */
            .driver-popover-title {
                font-size: 1.25rem !important;
                font-weight: 800 !important;
                color: #1e40af !important;
                margin-bottom: 14px !important;
                text-align: right !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
            }
            .dark .driver-popover-title {
                color: #60a5fa !important;
            }

            /* توضیحات */
            .driver-popover-description {
                font-size: 0.95rem !important;
                line-height: 1.8 !important;
                color: #475569 !important;
                text-align: justify !important;
                margin-bottom: 20px !important;
            }
            .dark .driver-popover-description {
                color: #cbd5e1 !important;
            }

            /* پیشرفت */
            .driver-popover-progress-text {
                font-size: 0.8rem !important;
                font-weight: 500 !important;
                color: #94a3b8 !important;
                flex-grow: 1 !important;
            }

            /* فوتر و دکمه‌ها */
            .driver-popover-footer {
                margin-top: 15px !important;
                border-top: 1px solid rgba(0,0,0,0.05) !important;
                padding-top: 15px !important;
                display: flex !important;
                align-items: center !important;
            }
            .dark .driver-popover-footer {
                border-color: rgba(255,255,255,0.05) !important;
            }

            .driver-popover-navigation-btns {
                display: flex !important;
                gap: 8px !important;
                flex-direction: row-reverse !important;
            }

            .driver-popover-next-btn,
            .driver-popover-prev-btn {
                border-radius: 12px !important;
                padding: 8px 18px !important;
                font-weight: 600 !important;
                font-size: 0.85rem !important;
                transition: all 0.2s ease !important;
                border: none !important;
                cursor: pointer !important;
            }

            .driver-popover-next-btn {
                background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
                color: white !important;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
            }
            .driver-popover-next-btn:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 15px rgba(37, 99, 235, 0.4) !important;
            }

            .driver-popover-prev-btn {
                background: #f1f5f9 !important;
                color: #64748b !important;
            }
            .dark .driver-popover-prev-btn {
                background: #1e293b !important;
                color: #94a3b8 !important;
            }

            /* المان هایلایت شده */
            .driver-active-element {
                box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.4) !important;
                transition: all 0.3s ease !important;
                background: white !important;
                z-index: 100000 !important;
            }
            .dark .driver-active-element {
                background: #1e293b !important;
            }

            /* دکمه بستن */
            .driver-popover-close-btn {
                color: #94a3b8 !important;
                transition: color 0.2s !important;
            }
            .driver-popover-close-btn:hover {
                color: #ef4444 !important;
            }
        `}</style>
    );
};

export default OnboardingSystem;