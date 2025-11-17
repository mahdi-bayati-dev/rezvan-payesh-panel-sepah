<?php

namespace App\Http\Middleware;

use App\Models\LicenseKey;
use App\Services\LicenseService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Response as ResponseFacade;

class CheckLicenseStatus
{
    protected LicenseService $licenseService;
    private int $max_trial_days_allowed = 30;

    public function __construct(LicenseService $licenseService)
    {
        $this->licenseService = $licenseService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $installationId = $this->licenseService->getInstallationId();
        $license = LicenseKey::where('installation_id', $installationId)->first();

        $status = $license->status;
        $finalStatus = $status;

        switch ($status)
        {
            case 'trial':
                $finalStatus = $this->handleTrialStatus($license);
                break;

            case 'licensed':
                $finalStatus = $this->handleLicensedStatus($license);
                break;

            case 'trial_expired':
            case 'license_expired':
                $finalStatus = $status;
                break;

            default:
                $finalStatus = 'tampered';
        }

        if ($finalStatus === 'trial' || $finalStatus === 'licensed')
        {
            return $next($request);
        }

        return $this->abort($finalStatus);
    }

    /**
     * منطق بررسی وضعیت آزمایشی (Trial)
     */
    private function handleTrialStatus(LicenseKey $license): string
    {
        $masterRecord = $this->licenseService->getMasterTrialRecord();
        $currentDate = Carbon::today()->toDateString();

        if ($currentDate < $masterRecord['last_run_date'])
        {
            $license->update(['status' => 'tampered']);
            return 'tampered';
        }

        if ($currentDate > $masterRecord['last_run_date'])
        {
            $masterRecord['days_used']++;
            $masterRecord['last_run_date'] = $currentDate;
        }

        if ($masterRecord['days_used'] > $this->max_trial_days_allowed)
        {
            $license->update(['status' => 'trial_expired']);
            return 'trial_expired';
        }

        try
        {
            $this->licenseService->syncTrialData($masterRecord);
        }
        catch (\Exception $e)
        {
            return 'tampered';
        }

        return 'trial';
    }

    /**
     * منطق بررسی وضعیت لایسنس (Licensed)
     */
    private function handleLicensedStatus(LicenseKey $license): string
    {
        $status = $this->licenseService->checkLicensedStatus($license);

        if ($status === 'tampered') {
             $license->update(['status' => 'tampered']);
        }

        return $status;
    }

    /**
     * بازگرداندن خطای لایسنس
     */
    private function abort(string $status): Response
    {
        $message = 'دسترسی غیرمجاز. لایسنس شما نامعتبر است.';
        switch ($status)
        {
            case 'trial_expired':
                $message = 'دوره آزمایشی شما به پایان رسیده است. لطفا لایسنس خود را وارد کنید.';
                break;
            case 'license_expired':
                $message = 'لایسنس شما منقضی شده است. لطفا آن را تمدید کنید.';
                break;
            case 'tampered':
                $message = 'لایسنس شما دستکاری شده یا نامعتبر است. با پشتیبانی تماس بگیرید.';
                break;
        }

        return ResponseFacade::json([
            'error_code' => strtoupper($status),
            'message' => $message
        ], 499);
    }
}