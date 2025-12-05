<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Device;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AttendanceLogController extends Controller
{
    public function handleAiRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_api_key' => ['required', 'string'],
            'personnel_code' => ['required', 'string', 'exists:employees,personnel_code'],
            'event_type' => ['required', 'string', Rule::in([AttendanceLog::TYPE_CHECK_IN, AttendanceLog::TYPE_CHECK_OUT])],
            'timestamp' => ['required', 'date_format:Y-m-d H:i:s'],
            'source_name'=> ['nullable', 'string'],
        ]);

        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        $device = Device::where('api_key', $validated['device_api_key'])->first();
        if (!$device) {
            return response()->json(['message' => 'Invalid API Key.'], 401);
        }
        if ($device->status !== 'online') {
            return response()->json(['message' => 'Device is not active.'], 403);
        }

        $employee = Employee::where('personnel_code', $validated['personnel_code'])->first();

        $logTimestamp = Carbon::parse($validated['timestamp']);

        // ---------------------------------------------------------
        // 1. تشخیص هوشمند شیفت (امروز یا دیروز؟)
        // ---------------------------------------------------------
        // این بخش برای شیفت‌های شبانه (که از نیمه‌شب عبور می‌کنند) حیاتی است.
        // ما برنامه کاری را برای "تاریخ لاگ" و "یک روز قبل از لاگ" می‌گیریم.
        $scheduleToday = $employee->getWorkScheduleFor($logTimestamp);
        $scheduleYesterday = $employee->getWorkScheduleFor($logTimestamp->copy()->subDay());

        $schedule = null;
        $diffToday = 999999;
        $diffYesterday = 999999;

        if ($validated['event_type'] == AttendanceLog::TYPE_CHECK_IN) {
            // برای ورود، فاصله زمانی با "شروع شیفت" را مقایسه می‌کنیم
            if ($scheduleToday && $scheduleToday->expected_start) {
                $diffToday = abs($logTimestamp->diffInMinutes($scheduleToday->expected_start));
            }
            if ($scheduleYesterday && $scheduleYesterday->expected_start) {
                // مثلاً اگر شیفت دیشب ساعت 22 شروع شده و الان 1 بامداد است
                $diffYesterday = abs($logTimestamp->diffInMinutes($scheduleYesterday->expected_start));
            }
        } else {
            // برای خروج، فاصله زمانی با "پایان شیفت" را مقایسه می‌کنیم
            if ($scheduleToday && $scheduleToday->expected_end) {
                $diffToday = abs($logTimestamp->diffInMinutes($scheduleToday->expected_end));
            }
            if ($scheduleYesterday && $scheduleYesterday->expected_end) {
                // مثلاً اگر شیفت دیشب ساعت 4 صبح امروز تمام می‌شود و الان 03:55 است
                $diffYesterday = abs($logTimestamp->diffInMinutes($scheduleYesterday->expected_end));
            }
        }

        // انتخاب شیفتی که زمانش به زمان لاگ نزدیک‌تر است
        // اگر تفاوت خیلی کم باشد (مثلاً زیر 12 ساعت)، اولویت با شیفتی است که فاصله کمتری دارد
        if ($diffYesterday < $diffToday) {
            $schedule = $scheduleYesterday;
        } else {
            $schedule = $scheduleToday;
        }

        // ---------------------------------------------------------
        // 2. دریافت آخرین لاگ (سراسری) برای بررسی بازگشت به کار
        // ---------------------------------------------------------
        // آخرین لاگ ثبت شده قبل از این زمان را می‌گیریم (فارغ از اینکه مال امروز است یا دیروز)
        $lastLog = AttendanceLog::where('employee_id', $employee->id)
            ->where('timestamp', '<', $logTimestamp)
            ->orderBy('timestamp', 'desc')
            ->first();

        // تشخیص اینکه آیا این ورود اول است یا قبلاً وارد شده؟
        // اگر آخرین لاگ "ورود" باشد، یعنی هنوز در حال کار است یا لاگ خروج فراموش شده
        // اگر آخرین لاگ "خروج" باشد، یعنی قبلاً وارد شده و خارج شده (سناریوی بازگشت)
        // برای سادگی، اگر آخرین لاگ وجود داشته باشد و زمانش خیلی پرت نباشد (مثلا مال 2 روز پیش نباشد)،
        // می‌توانیم فرض کنیم قبلاً CheckIn داشته.
        $hasPriorCheckIn = false;
        if ($schedule && $schedule->expected_start) {
             // اگر لاگی در بازه این شیفت وجود داشته باشد
             // (مثلاً از 2 ساعت قبل از شروع شیفت تا الان)
             $hasPriorCheckIn = AttendanceLog::where('employee_id', $employee->id)
                ->where('timestamp', '>=', $schedule->expected_start->copy()->subHours(4))
                ->where('timestamp', '<', $logTimestamp)
                ->where('event_type', AttendanceLog::TYPE_CHECK_IN)
                ->exists();
        }

        $lateness_minutes = 0;
        $early_departure_minutes = 0;

        if ($schedule)
        {
            $expectedStart = $schedule->expected_start;
            $expectedEnd = $schedule->expected_end;
            $floatingStart = $schedule->floating_start ?? 0;
            $floatingEnd = $schedule->floating_end ?? 0;

            if ($validated['event_type'] == AttendanceLog::TYPE_CHECK_IN && $expectedStart)
            {
                // --- سناریوی ۱: بازگشت به کار (ورود مجدد پس از خروج موقت/جیم شدن) ---
                if ($lastLog && $lastLog->event_type == AttendanceLog::TYPE_CHECK_OUT)
                {
                    // اگر آخرین لاگ خروج بوده و فاصله زمانی معقول است (مثلاً زیر 16 ساعت)
                    // یعنی فرد در حال بازگشت به همان شیفت است.

                    // الف: باطل کردن تعجیل لاگ قبلی (چون به کار برگشته)
                    if ($lastLog->early_departure_minutes > 0) {
                        $lastLog->early_departure_minutes = 0;
                        $lastLog->save();
                    }

                    // ب: محاسبه مدت زمان غیبت (فاصله خروج قبلی تا این ورود)
                    $lastExitTime = Carbon::parse($lastLog->timestamp);
                    $gapMinutes = $lastExitTime->diffInMinutes($logTimestamp);

                    // ثبت مدت زمان بیرون بودن به عنوان "تاخیر" در لاگ جدید
                    $lateness_minutes = $gapMinutes;
                }
                // --- سناریوی ۲: اولین ورود شیفت ---
                elseif (!$hasPriorCheckIn)
                {
                    // اگر اولین بار است وارد می‌شود، نسبت به شروع شیفت سنجیده می‌شود
                    if ($logTimestamp->gt($expectedStart))
                    {
                        $diffInMinutes = $expectedStart->diffInMinutes($logTimestamp);

                        // اعمال فرجه شناور (فقط برای شروع شیفت)
                        if ($diffInMinutes > $floatingStart)
                        {
                            $lateness_minutes = $diffInMinutes;
                        }
                    }
                }
            }
            elseif ($validated['event_type'] == AttendanceLog::TYPE_CHECK_OUT && $expectedEnd)
            {
                // --- سناریوی خروج (شامل شیفت شب) ---
                // اگر زودتر از پایان شیفت می‌رود
                Log::info("the exit time is: " . $expectedEnd->diffInMinutes($logTimestamp));
                if ($logTimestamp->lt($expectedEnd))
                {
                    Log::info("the exit time is2 : " . $expectedEnd->diffInMinutes($logTimestamp));
                    Log::info("the expectedEnd time is: " . $expectedEnd);
                    Log::info("the logTimestamp is: " . $logTimestamp);
                    $diffInMinutes = abs($expectedEnd->diffInMinutes($logTimestamp));

                    if ($diffInMinutes > $floatingEnd)
                    {
                        $early_departure_minutes = $diffInMinutes;
                    }
                }
            }
        }

        $log = AttendanceLog::create([
            'employee_id' => $employee->id,
            'timestamp' => $logTimestamp->toDateTimeString(),
            'event_type' => $validated['event_type'],
            'device_id' => $device->id,
            'source_name' => $validated['source_name'] ?? $device->name,
            'source_type' => 'auto',
            'lateness_minutes' => $lateness_minutes,
            'early_departure_minutes' => $early_departure_minutes,
            'remarks' => $validated['source_name'],
        ]);

        return response()->json([
            'message' => 'Attendance log created successfully',
            'log_id' => $log->id,
            'calculated_lateness' => $lateness_minutes,
            'calculated_early_departure' => $early_departure_minutes,
            'matched_schedule_start' => $schedule ? $schedule->expected_start->toDateTimeString() : null
        ], 201);
    }
}