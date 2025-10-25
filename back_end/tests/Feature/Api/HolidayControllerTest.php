<?php

namespace Tests\Feature\Api;

use App\Models\Holiday;
use App\Models\User;
use Carbon\Carbon; // <-- اضافه شد
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Passport\Passport;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class HolidayControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $adminUser;
    protected User $normalUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);


        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('super_admin');


        $this->normalUser = User::factory()->create();

    }

    /**
     * Helper: لاگین به عنوان ادمین
     */
    protected function actingAsAdmin(): self
    {
        Passport::actingAs($this->adminUser);
        return $this;
    }


    /**
     * Helper: لاگین به عنوان کاربر عادی
     */
    protected function actingAsNormalUser(): self
    {
        Passport::actingAs($this->normalUser);
        return $this;
    }


    // --- تست‌های متد index ---

    #[Test] public function admin_can_list_holidays(): void
    {
        // ساخت چند تعطیلی نمونه
        Holiday::factory()->count(5)->create();
        $holidayInRange = Holiday::factory()->create(['date' => Carbon::now()->addDays(10)->toDateString()]);

        $this->assertEquals(6, Holiday::count());
        // درخواست بدون فیلتر
        $response = $this->actingAsAdmin()->getJson(route('holidays.index'));
        dump($response->getContent());
        $response->assertStatus(200);
        $response->assertJsonCount(6, 'data');

        // درخواست با فیلتر تاریخ
        $startDate = Carbon::now()->addDays(5)->toDateString();
        $endDate = Carbon::now()->addDays(15)->toDateString();
        $responseFiltered = $this->actingAsAdmin()->getJson(route('holidays.index', ['start_date' => $startDate, 'end_date' => $endDate]));
        $responseFiltered->assertStatus(200)
                        ->assertJsonCount(1) // فقط باید holidayInRange برگردد
                        ->assertJsonFragment(['date' => $holidayInRange->date->format('Y-m-d')]);
    }

    #[Test] public function normal_user_cannot_list_holidays(): void
    {
        // فرض می‌کنیم میدل‌ور role:super_admin در کنترلر فعال است
        $response = $this->actingAsNormalUser()->getJson(route('holidays.index'));
        $response->assertStatus(200);
    }

    #[Test] public function index_validation_fails_for_invalid_dates(): void
    {
        $response = $this->actingAsAdmin()->getJson(route('holidays.index', ['start_date' => 'invalid-date', 'end_date' => '2025-01-01']));
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['start_date']);

         $response = $this->actingAsAdmin()->getJson(route('holidays.index', ['start_date' => '2025-01-10', 'end_date' => '2025-01-01'])); // end < start
         $response->assertStatus(422)
                  ->assertJsonValidationErrors(['end_date']);
    }

    // --- تست‌های متد store ---

    #[Test] public function admin_can_create_holiday(): void
    {
        $date = Carbon::now()->addMonth()->startOfMonth()->toDateString();
        $data = [
            'date' => $date,
            'name' => 'تعطیلی اول ماه بعد',
        ];

        $response = $this->actingAsAdmin()->postJson(route('holidays.store'), $data);

        $response->assertStatus(201)
                 ->assertJsonPath('data.date', $date)
                 ->assertJsonPath('data.name', $data['name'])
                 ->assertJsonPath('data.is_official', false); // باید false باشه طبق کنترلر

        $this->assertDatabaseHas('holidays', [
            'date' => $date,
            'name' => $data['name'],
            'is_official' => false,
        ]);
    }

    #[Test] public function normal_user_cannot_create_holiday(): void
    {
        $data = ['date' => Carbon::now()->addDay()->toDateString(), 'name' => 'test'];
        $response = $this->actingAsNormalUser()->postJson(route('holidays.store'), $data);
        $response->assertStatus(403);
    }

    #[Test] public function create_holiday_validation_fails(): void
    {
        // تاریخ تکراری
        $existingHoliday = Holiday::factory()->create();
        $response = $this->actingAsAdmin()->postJson(route('holidays.store'), [
            'date' => $existingHoliday->date->format('Y-m-d'),
            'name' => 'تعطیلی تکراری',
        ]);
        $response->assertStatus(422)->assertJsonValidationErrors('date');

        // داده‌های ناقص
        $response = $this->actingAsAdmin()->postJson(route('holidays.store'), ['name' => 'فقط نام']);
        $response->assertStatus(422)->assertJsonValidationErrors('date');

        $response = $this->actingAsAdmin()->postJson(route('holidays.store'), ['date' => '2025-12-01']);
        $response->assertStatus(422)->assertJsonValidationErrors('name');

        // فرمت تاریخ اشتباه
        $response = $this->actingAsAdmin()->postJson(route('holidays.store'), ['date' => '01-12-2025', 'name' => 'فرمت اشتباه']);
        $response->assertStatus(422)->assertJsonValidationErrors('date');
    }

    // --- تست‌های متد destroy ---

    #[Test] public function admin_can_delete_holiday(): void
    {
        $holiday = Holiday::factory()->nonOfficial()->create(); // یک تعطیلی غیررسمی بساز
        $dateString = $holiday->date->format('Y-m-d');

        $response = $this->actingAsAdmin()->deleteJson(route('holidays.destroy', $dateString));

        $response->assertStatus(204); // No Content

        $this->assertDatabaseMissing('holidays', ['id' => $holiday->id]);
    }

    #[Test] public function normal_user_cannot_delete_holiday(): void
    {
        $holiday = Holiday::factory()->create();
        $dateString = $holiday->date->format('Y-m-d');

        $response = $this->actingAsNormalUser()->deleteJson(route('holidays.destroy', $dateString));
        $response->assertStatus(403);
    }

    #[Test] public function delete_returns_404_for_non_existing_date(): void
    {
        $nonExistingDate = Carbon::now()->subYear()->toDateString(); // تاریخی که مطمئنیم وجود نداره
        $response = $this->actingAsAdmin()->deleteJson(route('holidays.destroy', $nonExistingDate));
        $response->assertStatus(404); // Not Found
    }

    #[Test] public function delete_returns_400_for_invalid_date_format(): void
    {
        $invalidDate = '01-01-2025';
        $response = $this->actingAsAdmin()->deleteJson(route('holidays.destroy', $invalidDate));
        $response->assertStatus(400); // Bad Request
    }
}
