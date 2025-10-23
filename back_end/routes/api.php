<?php

use App\Http\Controllers\Api\AttendanceLogController;
use App\Http\Controllers\Api\AuthController;
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
});



Route::post('/log-attendance', [AttendanceLogController::class, 'handleAiRequest'])

     ->name('api.attendance.log');