<?php

use App\Http\Controllers\api\AttendanceLogController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



Route::post('/login', [AuthController::class, 'login'])->name('api.login');


Route::middleware('auth:api')->group(function () {
    Route::get("/test", function () {
        return "test";
    });
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');
});



Route::post('/log-attendance', [AttendanceLogController::class, 'handleAiRequest'])

     ->name('api.attendance.log');