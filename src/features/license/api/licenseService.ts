// src/features/license/api/licenseService.ts

import axiosInstance from "@/lib/AxiosConfig";
import type { 
    LicenseState, 
    ActivateLicensePayload, 
    ActivateLicenseResponse 
} from "../types";

/**
 * سرویس مدیریت درخواست‌های لایسنس
 * تمام ارتباطات با اندپوینت /api/license در اینجا متمرکز است.
 */
export const licenseApi = {
    
    /**
     * دریافت وضعیت فعلی لایسنس
     * متد: GET
     */
    getStatus: async (): Promise<LicenseState> => {
        const response = await axiosInstance.get<LicenseState>('/license');
        return response.data;
    },

    /**
     * فعال‌سازی یا تمدید لایسنس با توکن جدید
     * متد: POST
     */
    activate: async (payload: ActivateLicensePayload): Promise<ActivateLicenseResponse> => {
        const response = await axiosInstance.post<ActivateLicenseResponse>('/license', payload);
        return response.data;
    }
};