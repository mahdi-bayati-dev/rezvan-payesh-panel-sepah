<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CheckSystem as LicenseService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PackController extends Controller
{


    public function __construct(protected LicenseService $licenseService)
    {
    }

    /**
     * دریافت اطلاعات فعلی لایسنس (شامل شناسه نصب و وضعیت آزمایشی)
     */
    public function show(): JsonResponse
    {
        $details = $this->licenseService->getLicenseDetails();
        return response()->json($details);
    }

    /**
     * اعمال توکن لایسنس جدید و ارتقا از حالت آزمایشی
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'license_token' => 'required|string',
        ]);

        $success = $this->licenseService->applyLicenseToken($request->input('license_token'));

        if ($success) {
            return response()->json([
                'message' => 'لایسنس با موفقیت اعمال و برنامه فعال شد.',
                'license' => $this->licenseService->getLicenseDetails()
            ],200);
        }

        return response()->json([
            'message' => 'توکن لایسنس نامعتبر، دستکاری شده، منقضی شده، یا با این شناسه نصب مطابقت ندارد.'
        ], 499);
    }
}