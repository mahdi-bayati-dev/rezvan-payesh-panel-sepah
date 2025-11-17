<?php

namespace App\Http\Controllers\Api;

use App\Exports\AttendanceLogExport;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessAttendanceExportJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends Controller
{
    public function requestAttendanceExport(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(),
            [
            'date_from' => 'required|date|before_or_equal:date_to',
            'date_to' => 'required|date|after_or_equal:date_from',
            'sort_by' => ['nullable', 'string', Rule::in(['timestamp', 'employee_name'])], // ستون‌های مجاز مرتب‌سازی
            'sort_direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'columns' => 'required|array|min:1',
            'columns.*' => ['required', 'string', Rule::in(array_keys(AttendanceLogExport::ALLOWED_COLUMNS))], // فقط ستون‌های مجاز
            'filters' => 'nullable|array',
            'filters.organization_id' => 'nullable|integer|exists:organizations,id',
            'filters.event_type' => ['nullable', 'string', Rule::in(['check_in', 'check_out'])],
            'filters.has_lateness' => 'nullable|boolean',
        ]);

        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $validatedOptions = $validator->validated();
        $filename = "attendance_user_{$user->id}_" . now()->timestamp . ".xlsx";

        ProcessAttendanceExportJob::dispatch($user, $validatedOptions, $filename);

        return response()->json([
            'message' => 'گزارش شما در حال آماده‌سازی است. پس از اتمام، لینک دانلود از طریق نوتیفیکیشن ارسال خواهد شد.',
        ], Response::HTTP_ACCEPTED);
    }

    /**
     * ارائه فایل گزارش برای دانلود (با لینک امضا شده)
     */
    public function downloadReport(Request $request, string $filename)
    {

        $disk = 'local_reports';
        $path = $filename;

        if (!str_contains($filename, "user_{$request->user()->id}_"))
        {
             return response()->json(['message' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        if (!Storage::disk($disk)->exists($path))
        {
            return response()->json(['message' => 'File not found or expired.'], Response::HTTP_NOT_FOUND);
        }

        return Storage::disk($disk)->response($path);
    }
}
