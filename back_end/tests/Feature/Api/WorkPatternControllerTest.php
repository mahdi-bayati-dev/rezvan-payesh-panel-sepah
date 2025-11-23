<?php

use App\Models\Employee;
use App\Models\User;
use App\Models\WorkGroup;
use App\Models\WorkPattern; // احتمالا منظور WeekPattern بوده اما فایل نوشته WorkPatternController. فرض بر WorkPattern (الگوی شیفت روزانه)
use App\Models\WeekPattern; // اگر منظور الگوی هفتگی است
use Database\Seeders\RoleSeeder;

// نکته: در فایل قبلی شما WeekPatternTest بود ولی اسم فایل WorkPatternControllerTest بود.
// اینجا فرض می‌کنیم منظور WeekPattern (الگوی هفتگی) است چون توابع createSampleWeekData داشتید.
// اگر منظورتان WorkPattern (شیفت روزانه) است، مدل را تغییر دهید.

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);
uses(\Illuminate\Foundation\Testing\WithFaker::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole('super_admin');
});

test('can create week pattern', function () {
    $data = createSampleWeekData('الگوی عادی');

    $this->actingAs($this->superAdmin)
         ->postJson(route('week-patterns.store'), $data)
         ->assertCreated()
         ->assertJsonPath('data.name', 'الگوی عادی');
});

test('can update week pattern', function () {
    $weekPattern = WeekPattern::factory()->create();
    $data = createSampleWeekData('الگوی ویرایش شده');

    $this->actingAs($this->superAdmin)
         ->putJson(route('week-patterns.update', $weekPattern->id), $data)
         ->assertOk()
         ->assertJsonPath('data.name', 'الگوی ویرایش شده');
});

test('cannot update week pattern with duplicate name', function () {
    $weekPattern = WeekPattern::factory()->create();
    $otherPattern = WeekPattern::factory()->create(['name' => 'الگوی دیگر']);

    $data = createSampleWeekData($otherPattern->name); // استفاده از نام تکراری

    $this->actingAs($this->superAdmin)
         ->putJson(route('week-patterns.update', $weekPattern->id), $data)
         ->assertUnprocessable()
         ->assertJsonValidationErrors('name');
});

test('can delete an unused week pattern', function () {
    $weekPattern = WeekPattern::factory()->create();

    $this->actingAs($this->superAdmin)
         ->deleteJson(route('week-patterns.destroy', $weekPattern->id))
         ->assertNoContent();

    $this->assertDatabaseMissing('week_patterns', ['id' => $weekPattern->id]);
});

test('cannot delete a week pattern assigned to work group', function () {
    $weekPattern = WeekPattern::factory()->create();
    WorkGroup::factory()->create(['week_pattern_id' => $weekPattern->id]);

    $this->actingAs($this->superAdmin)
         ->deleteJson(route('week-patterns.destroy', $weekPattern->id))
         ->assertStatus(409); // Conflict
});

// --- Helper Functions ---

function createSampleWeekData(string $name): array
{
    // ساخت دیتای فیک برای روزهای هفته
    // فرض: ۰ = شنبه، ۱ = یکشنبه ...
    $days = [];
    for ($i = 0; $i <= 6; $i++) {
        $days[] = [
            'day_of_week' => $i,
            'is_working_day' => $i !== 6, // جمعه تعطیل
            'start_time' => '08:00',
            'end_time' => '16:00',
            'work_duration_minutes' => 480
        ];
    }

    return [
        'name' => $name,
        'days' => $days
    ];
}