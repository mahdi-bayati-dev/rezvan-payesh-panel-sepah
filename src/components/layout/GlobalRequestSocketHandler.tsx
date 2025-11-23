import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import { type LeaveRequest, type User } from "@/features/requests/types";
import { LEAVE_REQUESTS_QUERY_KEY } from "@/features/requests/hook/useLeaveRequests";
import { PENDING_COUNT_QUERY_KEY } from "@/features/requests/hook/usePendingRequestsCount";

export const GlobalRequestSocketHandler = () => {
    const queryClient = useQueryClient();
    const currentUser = useAppSelector(selectUser) as User | null;
    
    const echo = getEcho();

    useEffect(() => {
        if (!currentUser || !echo) return;

        // --- تابع کمکی برای استخراج نام بررسی‌کننده ---
        const getProcessorName = (processor: any): string => {
            if (!processor) return 'سیستم';

            // ۱. اولویت اول: نام و نام خانوادگی مستقیم (اگر در User باشد)
            if (processor.first_name || processor.last_name) {
                return `${processor.first_name || ''} ${processor.last_name || ''}`.trim();
            }

            // ۲. اولویت دوم: اگر نام در رابطه employee باشد (ساختار تو در تو)
            if (processor.employee && (processor.employee.first_name || processor.employee.last_name)) {
                return `${processor.employee.first_name || ''} ${processor.employee.last_name || ''}`.trim();
            }

            // ۳. اولویت سوم: نام کاربری (user_name)
            if (processor.user_name) {
                return processor.user_name;
            }

            // ۴. اولویت چهارم: فیلد name (برخی فریم‌ورک‌ها این را دارند)
            if (processor.name) {
                return processor.name;
            }

            return 'مدیر سیستم';
        };

        // --- هندلر درخواست جدید ---
        const onNewRequest = (e: { request: LeaveRequest }) => {
            console.log("🔔 [Socket] New Request Event:", e);
            const req = e.request;
            const isSelf = req.employee.id === currentUser.employee?.id;

            if (!isSelf) {
                const name = `${req.employee.first_name} ${req.employee.last_name}`;
                toast.info(`🔔 درخواست جدید از: ${name}`, {
                    position: "bottom-left"
                });
            }

            queryClient.invalidateQueries({ queryKey: [LEAVE_REQUESTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [LEAVE_REQUESTS_QUERY_KEY, PENDING_COUNT_QUERY_KEY] });
        };

        // --- هندلر تغییر وضعیت ---
        const onRequestProcessed = (e: { request: LeaveRequest }) => {
            console.log("✅ [Socket] Processed Event:", e);
            const req = e.request;
            const isSelf = req.employee.id === currentUser.employee?.id;
            
            // ✅ استفاده از تابع اصلاح شده برای نام
            const processorName = getProcessorName(req.processor);

            if (isSelf) {
                const statusText = req.status === 'approved' ? 'تایید' : 'رد';
                const variant = req.status === 'approved' ? 'success' : 'error';
                
                if (req.processor?.id !== currentUser.id) {
                     toast[variant](`درخواست شما توسط ${processorName} ${statusText} شد.`);
                }
            }

            queryClient.invalidateQueries({ queryKey: [LEAVE_REQUESTS_QUERY_KEY] });
        };

        // --- کانال‌ها ---
        const activeChannels: string[] = [];
        const roles = currentUser.roles || [];

        // ۱. کانال شخصی
        const userChannelName = `App.User.${currentUser.id}`;
        echo.private(userChannelName).listen(".leave_request.processed", onRequestProcessed);
        activeChannels.push(userChannelName);

        // ۲. کانال‌های مدیریتی
        const isSuperAdmin = roles.includes("super_admin");
        const orgId = currentUser.employee?.organization?.id;

        const adminChannels: string[] = [];
        if (isSuperAdmin) {
            adminChannels.push("super-admin-global");
        } else if (orgId) {
            if (roles.includes("org-admin-l2")) adminChannels.push(`l2-channel.${orgId}`);
            if (roles.includes("org-admin-l3")) adminChannels.push(`l3-channel.${orgId}`);
        }

        adminChannels.forEach(channelName => {
            const ch = echo.private(channelName);
            ch.listen(".leave_request.submitted", onNewRequest);
            ch.listen(".leave_request.processed", onRequestProcessed);
            activeChannels.push(channelName);
        });

        console.log("📡 [GlobalSocket] Listening on:", activeChannels);

        return () => {
            const uCh = echo.private(userChannelName);
            uCh.stopListening(".leave_request.processed", onRequestProcessed);

            adminChannels.forEach(chName => {
                const ch = echo.private(chName);
                ch.stopListening(".leave_request.submitted", onNewRequest);
                ch.stopListening(".leave_request.processed", onRequestProcessed);
            });
        };

    }, [currentUser, queryClient, echo]);

    return null;
};