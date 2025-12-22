import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import { type LeaveRequest, type User } from "@/features/requests/types";
import { LEAVE_REQUESTS_QUERY_KEY } from "@/features/requests/hook/useLeaveRequests";
import { PENDING_COUNT_QUERY_KEY } from "@/features/requests/hook/usePendingRequestsCount";

/**
 * این کامپوننت وظیفه مدیریت رویدادهای وب‌سوکت مربوط به درخواست‌های مرخصی را دارد.
 * طبق بررسی لاگ‌ها، منطق تفکیک سطوح ادمین ۱، ۲ و ۳ به درستی عمل می‌کند.
 */
export const GlobalRequestSocketHandler = () => {
    const queryClient = useQueryClient();
    const currentUser = useAppSelector(selectUser) as User | null;
    const echo = getEcho();

    // استفاده از Ref برای جلوگیری از لاگ‌های تکراری در Strict Mode (اختیاری برای تمیزی کنسول)
    const activeChannelsRef = useRef<string[]>([]);

    useEffect(() => {
        if (!currentUser || !echo) return;

        // --- تابع کمکی برای استخراج نام پردازش‌کننده ---
        const getProcessorName = (processor: any): string => {
            if (!processor) return 'سیستم';
            const emp = processor.employee;
            if (processor.first_name || processor.last_name) {
                return `${processor.first_name || ''} ${processor.last_name || ''}`.trim();
            }
            if (emp && (emp.first_name || emp.last_name)) {
                return `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
            }
            return processor.user_name || 'مدیر سیستم';
        };

        // --- هندلرهای رویداد ---
        const onNewRequest = (e: { request: LeaveRequest }) => {
            const req = e.request;
            if (req.employee.id !== currentUser.employee?.id) {
                const name = `${req.employee.first_name} ${req.employee.last_name}`;
                toast.info(`🔔 درخواست جدید از: ${name}`, { position: "bottom-left" });
            }
            queryClient.invalidateQueries({ queryKey: [LEAVE_REQUESTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [LEAVE_REQUESTS_QUERY_KEY, PENDING_COUNT_QUERY_KEY] });
        };

        const onRequestProcessed = (e: { request: LeaveRequest }) => {
            const req = e.request;
            const isSelf = req.employee.id === currentUser.employee?.id;
            if (isSelf && req.processor?.id !== currentUser.id) {
                const statusText = req.status === 'approved' ? 'تایید' : 'رد';
                const variant = req.status === 'approved' ? 'success' : 'error';
                toast[variant](`درخواست شما توسط ${getProcessorName(req.processor)} ${statusText} شد.`);
            }
            queryClient.invalidateQueries({ queryKey: [LEAVE_REQUESTS_QUERY_KEY] });
        };

        // --- مدیریت کانال‌ها ---
        const roles = currentUser.roles || [];
        const orgId = currentUser.employee?.organization?.id;
        const adminChannels: string[] = [];

        // ۱. کانال اختصاصی کاربر
        const userChannelName = `App.User.${currentUser.id}`;
        echo.private(userChannelName).listen(".leave_request.processed", onRequestProcessed);

        // ۲. شناسایی کانال‌های مدیریتی (بدون تداخل)
        if (roles.includes("super_admin")) {
            adminChannels.push("super-admin-global");
        }

        if (orgId) {
            if (roles.includes("org-admin-l2")) adminChannels.push(`l2-channel.${orgId}`);
            if (roles.includes("org-admin-l3")) adminChannels.push(`l3-channel.${orgId}`);
        }

        // ساب اسکرایب کردن
        adminChannels.forEach(chName => {
            echo.private(chName)
                .listen(".leave_request.submitted", onNewRequest)
                .listen(".leave_request.processed", onRequestProcessed);
        });

        const allActive = [userChannelName, ...adminChannels];
        activeChannelsRef.current = allActive;
        console.log("📡 [SocketHandler] Listening on channels:", allActive);

        return () => {
            console.log("🔌 [SocketHandler] Cleaning up subscriptions...");

            // خروج از کانال شخصی
            echo.private(userChannelName).stopListening(".leave_request.processed", onRequestProcessed);
            echo.leave(userChannelName);

            // خروج از کانال‌های مدیریتی
            adminChannels.forEach(chName => {
                echo.private(chName)
                    .stopListening(".leave_request.submitted", onNewRequest)
                    .stopListening(".leave_request.processed", onRequestProcessed);
                echo.leave(chName);
            });
        };
    }, [currentUser, queryClient, echo]);

    return null;
};