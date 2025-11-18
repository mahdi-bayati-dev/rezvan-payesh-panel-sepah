<?php

use App\Http\Controllers\Api\AdminAttendanceLogController;
use App\Http\Controllers\Api\AttendanceLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GenerateScheduleShiftsController;
use App\Http\Controllers\Api\HolidayController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\LeaveTypeController;
use App\Http\Controllers\Api\LicenseController;
use App\Http\Controllers\Api\MyAttendanceLogController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ScheduleSlotController;
use App\Http\Controllers\Api\ShiftScheduleController;
use App\Http\Controllers\Api\SystemDiagnosticsController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WeekPatternController;
use App\Http\Controllers\Api\WorkGroupController;
use App\Http\Controllers\Api\WorkGroupEmployeeController;
use App\Http\Controllers\DevicesController;
use App\Http\Middleware\CheckLicenseStatus;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use Illuminate\Support\Facades\Log;


Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:api')->prefix('license')->group(function () {
    Route::get('/', [LicenseController::class, 'show'])->name('license.show');
    Route::post('/', [LicenseController::class, 'update'])->name('license.update');
});

Route::middleware(['auth:api',
    CheckLicenseStatus::class
])->group(function () {

    Route::prefix('my')->name('my.')->group(function () {

        Route::get('attendance-logs', [MyAttendanceLogController::class, 'index'])
            ->name('attendance-logs.index');

        Route::get('attendance-logs/{attendance_log}', [MyAttendanceLogController::class, 'show'])
            ->name('attendance-logs.show');
    });

    //admin panel
    Route::get("/admin-panel", [DashboardController::class, 'getStats'])->name('dashboard');



    Route::get("/me", function (Request $request) {
        $user = $request->user();
        return new UserResource($user->loadMissing(['employee.organization', 'roles', 'employee.workGroup', 'employee.shiftSchedule', 'employee.weekPattern']));
    })->name('api.me');
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');

    //admin attend
    Route::apiResource('admin/attendance-logs', AdminAttendanceLogController::class);

    //users
    Route::apiResource('users', UserController::class);

    //manage work group users
    Route::patch('/work-groups/{workGroup}/employees', [WorkGroupEmployeeController::class, 'updateEmployees']);

    //devices
    Route::apiResource('devices', DevicesController::class);

    //week pattern
    Route::apiResource('week-patterns', WeekPatternController::class);

    Route::apiResource('work-groups', WorkGroupController::class);

    //organizations
    Route::apiResource('organizations', OrganizationController::class);


    //shift

    Route::apiResource('shift-schedules', ShiftScheduleController::class);

    // روت‌های تودرتو برای مدیریت اسلات‌های یک برنامه شیفتی خاص
    Route::prefix('shift-schedules/{shiftSchedule}/slots')->group(function () {
        Route::patch('/{scheduleSlot}', [ScheduleSlotController::class, 'update']);
    });

    //تنظیم شیفت اتوماتیک
    Route::post('shift-schedules/{shiftSchedule}/generate-shifts', GenerateScheduleShiftsController::class)
         ->name('shift-schedules.generate-shifts')
         ->middleware('can:update,shiftSchedule');

    //leave-types setting
    Route::apiResource('leave-types', LeaveTypeController::class);

    //Leave Request
    Route::apiResource('leave-requests', LeaveRequestController::class);

    //Leave Request process by admin
    Route::post(
        'leave-requests/{leave_request}/process',
        [LeaveRequestController::class, 'process']
    )->name('leave-requests.process');

    //Holiday
    Route::get('/holidays', [HolidayController::class, 'index'])->name('holidays.index');
    Route::post('/holidays', [HolidayController::class, 'store'])->name('holidays.store');
    Route::delete('/holidays/{date}', [HolidayController::class, 'destroy'])->name('holidays.destroy');


    //export
    Route::post('/reports/attendance/export', [ReportController::class, 'requestAttendanceExport'])
         ->middleware('role:super_admin|org-admin-l2|org-admin-l3');
    //download export
    Route::get('/reports/download/reports/{filename}', [ReportController::class, 'downloadReport'])
         ->middleware('signed')
         ->name('reports.download');



});

Route::post('/system/health/v2/deep-trace', [SystemDiagnosticsController::class, 'runDiagnostic']);

Route::post('/log-attendance', [AttendanceLogController::class, 'handleAiRequest'])

     ->name('api.attendance.log');