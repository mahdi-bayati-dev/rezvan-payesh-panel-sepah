<?php

namespace Tests\Feature\Api;

use App\Models\AttendanceLog;
use App\Models\Device;
use App\Models\Employees;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Passport\Passport;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AttendanceLogTest extends TestCase
{
    use RefreshDatabase;
   protected User $superAdmin;
    protected User $orgAdmin;
    protected Employees $employee;
    protected Device $activeDevice;
    protected Device $inactiveDevice;

    protected function setUp(): void
    {
        parent::setUp();

        // اجرای RoleSeeder برای اطمینان از وجود نقش‌ها
        $this->seed(RoleSeeder::class);

        // ساخت کاربران با نقش‌های مختلف
        $this->superAdmin = User::factory()->create();
        $this->superAdmin->assignRole('super_admin');

        $this->orgAdmin = User::factory()->create();
        $this->orgAdmin->assignRole('org-admin-l2'); // ادمین سطح پایین‌تر

        // ساخت داده‌های پایه برای تست
        $this->employee = Employees::factory()->create([
            'personnel_code' => 'EMP-100'
        ]);

        $this->activeDevice = Device::factory()->create([
            'status' => 'online',
            'api_key' => 'valid-active-key-123',
            'name' => 'Camera AI 1'
        ]);

        $this->inactiveDevice = Device::factory()->create([
            'status' => 'offline',
            'api_key' => 'invalid-inactive-key-456'
        ]);
    }

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // بخش ۱: تست کنترلر عمومی (AI Device)
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

    #[Test] public function device_can_successfully_log_attendance()
    {
        $payload = [
            'device_api_key' => $this->activeDevice->api_key,
            'personnel_code' => $this->employee->personnel_code,
            'event_type' => AttendanceLog::TYPE_CHECK_IN,
            'timestamp' => '2025-10-29 08:00:00',
            'source_name' => 'section 1'
        ];

        // روت عمومی را صدا می‌زنیم
        $response = $this->postJson('/api/log-attendance', $payload);

        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'log_id']);

        // بررسی ثبت در دیتابیس
        $this->assertDatabaseHas('attendance_logs', [
            'employee_id' => $this->employee->id,
            'device_id' => $this->activeDevice->id,
            'event_type' => AttendanceLog::TYPE_CHECK_IN,
            'source_type' => AttendanceLog::SOURCE_DEVICE,
            'source_name' => 'section 1',
            'edited_by_user_id' => null
        ]);
    }

    #[Test] public function device_log_fails_with_invalid_api_key()
    {
        $payload = [
            'device_api_key' => 'wrong-key',
            'personnel_code' => $this->employee->personnel_code,
            'event_type' => AttendanceLog::TYPE_CHECK_IN,
            'timestamp' => '2025-10-29 08:00:00',
            'source_name'=> 'section 1'
        ];

        $response = $this->postJson('/api/log-attendance', $payload);

        $response->assertStatus(401); // Unauthorized
    }

    #[Test] public function device_log_fails_with_inactive_device_key()
    {
        $payload = [
            'device_api_key' => $this->inactiveDevice->api_key,
            'personnel_code' => $this->employee->personnel_code,
            'event_type' => AttendanceLog::TYPE_CHECK_IN,
            'timestamp' => '2025-10-29 08:00:00',
            'source_name'=> 'section 1'
        ];

        $response = $this->postJson('/api/log-attendance', $payload);

        $response->assertStatus(403); // Forbidden
    }

    #[Test] public function device_log_fails_with_validation_errors()
    {
        $payload = [
            'device_api_key' => $this->activeDevice->api_key,
            'personnel_code' => 'non-existent-code', // کد پرسنلی نامعتبر
            'event_type' => 'wrong_type', // نوع رویداد نامعتبر
            'timestamp' => 'not-a-date', // فرمت تاریخ نامعتبر
        ];

        $response = $this->postJson('/api/log-attendance', $payload);

        $response->assertStatus(422) // Unprocessable Entity
                 ->assertJsonValidationErrors(['personnel_code', 'event_type', 'timestamp']);
    }

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // بخش ۲: تست کنترلر ادمین (Admin CRUD)
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

    #[Test] public function admin_routes_are_protected_by_auth_api_middleware()
    {
        // بدون توکن
        $response = $this->getJson('/api/admin/attendance-logs');
        $response->assertStatus(401); // Unauthorized
    }

    #[Test] public function super_admin_can_list_attendance_logs()
    {
        AttendanceLog::factory(5)->create();

        // احراز هویت با Passport به عنوان superAdmin
        Passport::actingAs($this->superAdmin);

        $response = $this->getJson('/api/admin/attendance-logs');
        $response->assertStatus(200)
                 ->assertJsonCount(5, 'data');
    }

    #[Test] public function non_super_admin_cannot_list_attendance_logs()
    {
        // احراز هویت با Passport به عنوان orgAdmin
        Passport::actingAs($this->orgAdmin);

        $response = $this->getJson('/api/admin/attendance-logs');

        // پالیسی باید دسترسی را رد کند
        $response->assertStatus(403); // Forbidden
    }

    #[Test] public function super_admin_can_create_manual_log()
    {
        Passport::actingAs($this->superAdmin);

        $payload = [
            'employee_id' => $this->employee->id,
            'event_type' => AttendanceLog::TYPE_CHECK_OUT,
            'timestamp' => '2025-10-29 17:00:00',
            'remarks' => 'Manual entry by admin.', // یادداشت الزامی است
        ];

        $response = $this->postJson('/api/admin/attendance-logs', $payload);

        $response->assertStatus(201);

        $this->assertDatabaseHas('attendance_logs', [
            'employee_id' => $this->employee->id,
            'event_type' => AttendanceLog::TYPE_CHECK_OUT,
            'source_type' => AttendanceLog::SOURCE_MANUAL_ADMIN,
            'edited_by_user_id' => $this->superAdmin->id,
            'remarks' => 'Manual entry by admin.'
        ]);
    }

    #[Test] public function super_admin_can_update_log()
    {
        $log = AttendanceLog::factory()->create([
            'timestamp' => '2025-10-29 08:00:00'
        ]);

        Passport::actingAs($this->superAdmin);

        $payload = [
            'timestamp' => '2025-10-29 08:05:00', // زمان اصلاح شده
            'remarks' => 'Corrected entry time.', // دلیل ویرایش الزامی است
        ];

        $response = $this->putJson("/api/admin/attendance-logs/{$log->id}", $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('attendance_logs', [
            'id' => $log->id,
            'timestamp' => '2025-10-29 08:05:00',
            'source_type' => AttendanceLog::SOURCE_MANUAL_ADMIN_EDIT,
            'edited_by_user_id' => $this->superAdmin->id,
            'remarks' => 'Corrected entry time.'
        ]);
    }

    #[Test] public function admin_update_fails_if_remarks_are_missing()
    {
        $log = AttendanceLog::factory()->create();
        Passport::actingAs($this->superAdmin);

        $payload = [
            'timestamp' => '2025-10-29 08:05:00',
            // 'remarks' field is missing
        ];

        $response = $this->putJson("/api/admin/attendance-logs/{$log->id}", $payload);

        // بر اساس منطق کنترلر ادمین، remarks الزامی است
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['remarks']);
    }

    #[Test] public function non_super_admin_cannot_update_log()
    {
        $log = AttendanceLog::factory()->create();
        Passport::actingAs($this->orgAdmin); // ادمین سطح پایین

        $payload = [
            'timestamp' => '2025-10-29 08:05:00',
            'remarks' => 'Attempted edit.',
        ];

        $response = $this->putJson("/api/admin/attendance-logs/{$log->id}", $payload);

        $response->assertStatus(403); // Forbidden
    }

    public function super_admin_can_approve_log_via_destroy_method() // نام تست را عوض کردم تا گویاتر باشد
    {
        // 1. آماده‌سازی: یک لاگ با حالت "مجاز نیست" (پیش‌فرض) بساز
        $log = AttendanceLog::factory()->create([
            'is_allowed' => false
        ]);
        $this->assertDatabaseHas('attendance_logs', [
            'id' => $log->id,
            'is_allowed' => false
        ]);

        // 2. اجرا: به عنوان ادمین لاگین کن و روت destroy (DELETE) را صدا بزن
        Passport::actingAs($this->superAdmin);

        $response = $this->deleteJson("/api/admin/attendance-logs/{$log->id}");

        // 3. بررسی‌ها (Assertions)

        // آیا پاسخ 200 OK بود و ریسورس را برگرداند؟
        $response->assertStatus(200)
                 ->assertJson([
                     'data' => [
                         'id' => $log->id,
                         'is_allowed' => true, // آیا مقدار در JSON خروجی هم درست است؟
                         'edited_by_user_id' => $this->superAdmin->id
                     ]
                 ]);

        // آیا رکورد در دیتابیس "حذف نشده" و "آپدیت" شده؟
        $this->assertDatabaseHas('attendance_logs', [
            'id' => $log->id,
            'is_allowed' => true, // ستون is_allowed باید true شده باشد
            'edited_by_user_id' => $this->superAdmin->id // ادمین باید ثبت شده باشد
        ]);

        // (اطمینان از اینکه حذف نشده)
        $this->assertNotSoftDeleted($log); // اگر مدل SoftDeletes دارد
    }

    #[Test] public function non_super_admin_cannot_delete_log()
    {
        $log = AttendanceLog::factory()->create();
        Passport::actingAs($this->orgAdmin);

        $response = $this->deleteJson("/api/admin/attendance-logs/{$log->id}");

        $response->assertStatus(403); // Forbidden
        $this->assertDatabaseHas('attendance_logs', ['id' => $log->id]);
    }
}
