<?php

use App\Http\Controllers\Api\AttendanceLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HolidayController;
use App\Http\Controllers\Api\WorkGroupController;
use App\Http\Controllers\Api\WorkPatternController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



Route::post('/login', [AuthController::class, 'login'])->name('api.login');


Route::middleware('auth:api')->group(function () {
    Route::get("/me", function (Request $request) {
        $user = $request->user();
        $user->load(['employeeProfile']);
        return response()->json($user);
    })->name('api.me');;
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');


    Route::apiResource('work-patterns', WorkPatternController::class);

    Route::apiResource('work-groups', WorkGroupController::class);

    //Holiday
    Route::get('/holidays', [HolidayController::class, 'index'])->name('holidays.index');
    Route::post('/holidays', [HolidayController::class, 'store'])->name('holidays.store');
    Route::delete('/holidays/{date}', [HolidayController::class, 'destroy'])->name('holidays.destroy');

});



Route::post('/log-attendance', [AttendanceLogController::class, 'handleAiRequest'])

     ->name('api.attendance.log');