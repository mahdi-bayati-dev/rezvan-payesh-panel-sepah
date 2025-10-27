<?php

use App\Http\Controllers\Api\AttendanceLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HolidayController;
use App\Http\Controllers\Api\ScheduleSlotController;
use App\Http\Controllers\Api\ShiftScheduleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WeekPatternController;
use App\Http\Controllers\Api\WorkGroupController;
use App\Http\Controllers\Api\WorkPatternController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



Route::post('/login', [AuthController::class, 'login'])->name('api.login');


Route::middleware('auth:api')->group(function () {
    Route::get("/me", function (Request $request) {
        $user = $request->user();
        $user->load(['employee']);
        return response()->json($user);
    })->name('api.me');;
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');

    //users
    Route::apiResource('users', UserController::class);

    //week pattern
    Route::apiResource('week-patterns', WeekPatternController::class);

    Route::apiResource('work-groups', WorkGroupController::class);

    //shift

    Route::apiResource('shift-schedules', ShiftScheduleController::class);

    // روت‌های تودرتو برای مدیریت اسلات‌های یک برنامه شیفتی خاص
    Route::prefix('shift-schedules/{shiftSchedule}/slots')->group(function () {
        Route::patch('/{scheduleSlot}', [ScheduleSlotController::class, 'update']);
    });

    //Holiday
    Route::get('/holidays', [HolidayController::class, 'index'])->name('holidays.index');
    Route::post('/holidays', [HolidayController::class, 'store'])->name('holidays.store');
    Route::delete('/holidays/{date}', [HolidayController::class, 'destroy'])->name('holidays.destroy');

});



Route::post('/log-attendance', [AttendanceLogController::class, 'handleAiRequest'])

     ->name('api.attendance.log');