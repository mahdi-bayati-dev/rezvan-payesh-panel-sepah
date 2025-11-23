<?php

use App\Models\AttendanceLog;
use App\Models\Device;
use App\Models\Employee; // اصلاح نام مدل از Employees به Employee (طبق استاندارد لاراول مفرد است)
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Carbon;
use Laravel\Passport\Passport;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);
uses(\Illuminate\Foundation\Testing\WithFaker::class);

beforeEach(function () {
    // اجرای RoleSeeder برای اطمینان از وجود نقش‌ها
    $this->seed(RoleSeeder::class);

    // ساخت کاربران با نقش‌های مختلف
    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole('super_admin');

    // ادمین سطح سازمان (مثلا L2)
    $this->orgAdmin = User::factory()->create();
    $this->orgAdmin->assignRole('org-admin-l2');

    // ساخت کارمند نمونه
    $this->employee = Employee::factory()->create([
        'personnel_code' => 'EMP-100'
    ]);

    // دستگاه فعال
    $this->activeDevice = Device::factory()->create([
        'status' => 'online', // اصلاح وضعیت به active طبق معمول
        'api_key' => 'BE2l3j7tGQeTfDCpLGtBdFrmVkFjYHVjCeI4LGuoHswmeJ3ZOnjuV6V327aaEW3l',
        'name' => 'Camera AI 1'
    ]);

    // دستگاه غیرفعال
    $this->inactiveDevice = Device::factory()->create([
        'status' => 'inactive',
        'api_key' => 'invalid-inactive-key-456'
    ]);
});

test('device can successfully log attendance', function () {
    // شبیه‌سازی درخواست از سمت دستگاه
    $payload = [
        'api_key' => $this->activeDevice->api_key,
        'personnel_code' => $this->employee->personnel_code,
        'log_time' => Carbon::now()->toDateTimeString(),
        'type' => 'entry' // ورود
    ];

    $this->postJson('/api/device/logs', $payload)
         ->assertCreated()
         ->assertJsonStructure(['data' => ['id', 'employee_id', 'device_id']]);

    $this->assertDatabaseHas('attendance_logs', [
        'employee_id' => $this->employee->id,
        'device_id' => $this->activeDevice->id,
        'type' => 'entry'
    ]);
});

test('inactive device cannot log attendance', function () {
    $payload = [
        'api_key' => $this->inactiveDevice->api_key,
        'personnel_code' => $this->employee->personnel_code,
        'log_time' => Carbon::now()->toDateTimeString(),
    ];

    $this->postJson('/api/device/logs', $payload)
         ->assertStatus(403); // یا 401 بسته به لاجیک شما
});

test('super admin can soft delete (disallow) a log', function () {
    // 1. ایجاد یک لاگ معتبر
    $log = AttendanceLog::factory()->create([
        'is_allowed' => true // فرض بر این است که این فیلد وجود دارد
    ]);

    // 2. درخواست حذف (که در واقع آپدیت وضعیت است)
    $this->actingAs($this->superAdmin)
         ->deleteJson("/api/admin/attendance-logs/{$log->id}")
         ->assertOk()
         ->assertJsonPath('data.is_allowed', false); // باید فالس شده باشد

    // 3. بررسی دیتابیس
    $this->assertDatabaseHas('attendance_logs', [
        'id' => $log->id,
        'is_allowed' => false, // رکورد باید نامعتبر شده باشد
        // 'deleted_by' => $this->superAdmin->id // اگر لاگ می‌کنید چه کسی حذف کرده
    ]);
});

test('non super admin cannot delete log', function () {
    $log = AttendanceLog::factory()->create();

    $this->actingAs($this->orgAdmin)
         ->deleteJson("/api/admin/attendance-logs/{$log->id}")
         ->assertForbidden();
});
