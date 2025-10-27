<?php

namespace Tests\Feature\Api;

use App\Models\Employees;
use App\Models\User;
use App\Models\WeekPattern;
use App\Models\WorkGroup;
use App\Models\WorkPattern;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Passport\Passport;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class WorkPatternControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        // ایجاد یک کاربر ادمین برای احراز هویت در تست‌ها
        $this->user = User::factory()->create();
        $DatabaseSeeder = new DatabaseSeeder();
        $DatabaseSeeder->call(RoleSeeder::class);
        $this->user->assignRole("super_admin");
        Passport::actingAs($this->user);
    }

    /**
     * ساخت داده‌های نمونه برای ارسال در درخواست‌های store و update
     */
    private function createSampleWeekData(string $name): array
    {
        return [
            'name' => $name,
            'days' => [
                ['day_of_week' => 0, 'is_working_day' => true, 'start_time' => '08:00', 'end_time' => '16:00', 'work_duration_minutes' => 480], // Sat
                ['day_of_week' => 1, 'is_working_day' => true, 'start_time' => '08:00', 'end_time' => '16:00', 'work_duration_minutes' => 480], // Sun
                ['day_of_week' => 2, 'is_working_day' => true, 'start_time' => '08:00', 'end_time' => '16:00', 'work_duration_minutes' => 480], // Mon
                ['day_of_week' => 3, 'is_working_day' => true, 'start_time' => '08:00', 'end_time' => '16:00', 'work_duration_minutes' => 480], // Tue
                ['day_of_week' => 4, 'is_working_day' => true, 'start_time' => '08:00', 'end_time' => '16:00', 'work_duration_minutes' => 480], // Wed
                ['day_of_week' => 5, 'is_working_day' => true, 'start_time' => '08:00', 'end_time' => '12:00', 'work_duration_minutes' => 240], // Thu
                ['day_of_week' => 6, 'is_working_day' => false, 'start_time' => null, 'end_time' => null, 'work_duration_minutes' => 0],   // Fri (Rest)
            ]
        ];
    }

    public function can_get_list_of_week_patterns()
    {
        // ساخت ۳ الگوی هفتگی نمونه با استفاده از فکتوری
        WeekPattern::factory()->count(3)->create();

        // ارسال درخواست GET به اندپوینت index
        $response = $this->getJson(route('week-patterns.index'));

        // بررسی پاسخ
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'name',
                             'saturday_pattern_id',
                             'sunday_pattern_id',
                             'monday_pattern_id',      
                             'tuesday_pattern_id',     
                             'wednesday_pattern_id',   
                             'thursday_pattern_id',    
                             'friday_pattern_id',
                             'created_at',
                             'updated_at',

                             'saturday_pattern' => [
                                 'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                             ],
                             'sunday_pattern' => [
                                 'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                             ],
                             'monday_pattern' => [      
                                 'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                             ],
                             'tuesday_pattern' => [     
                                 'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                             ],
                             'wednesday_pattern' => [   
                                 'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                             ],
                             'thursday_pattern' => [   
                                 'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                             ],
                             'friday_pattern' => [     
                                 'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                             ],
                         ]
                     ],
                     'links',
                     'meta',
                 ])
                 ->assertJsonCount(3, 'data');
    }

    #[Test] public function can_create_a_new_week_pattern()
    {
        // داده‌های نمونه برای ارسال
        $data = $this->createSampleWeekData('برنامه اداری جدید');

        // ارسال درخواست POST
        $response = $this->postJson(route('week-patterns.store'), $data);

        // بررسی پاسخ
        $response->assertStatus(201) // وضعیت ۲0۱ (Created)
                 ->assertJsonFragment(['name' => 'برنامه اداری جدید']) // بررسی وجود نام در پاسخ
                 ->assertJsonStructure([
                     // ساختار اصلی WeekPatternResource
                     'data' => [ // اطمینان از وجود کلید data (از JsonResource)
                         'id',
                         'name',
                         'created_at',
                         'updated_at',
                         // بررسی ساختار جزئیات هر روز (که از WorkPatternResource می‌آید)
                         'saturday_pattern' => [
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                         'sunday_pattern' => [
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                         'monday_pattern' => [
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                         'tuesday_pattern' => [
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                         'wednesday_pattern' => [
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                         'thursday_pattern' => [
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                         'friday_pattern' => [
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                     ]
                 ]);

        // بررسی اینکه الگوهای اتمی مورد نیاز در دیتابیس ساخته شده‌اند
        // (با استفاده از مشخصات کلیدی که findOrCreateAtomicPattern استفاده می‌کند)
        $this->assertDatabaseHas('work_patterns', [
            'type' => 'fixed',
            'start_time' => '08:00',
            'end_time' => '16:00',
            'work_duration_minutes' => 480
        ]);
        $this->assertDatabaseHas('work_patterns', [
            'type' => 'fixed',
            'start_time' => '08:00',
            'end_time' => '12:00',
            'work_duration_minutes' => 240
        ]);
        $this->assertDatabaseHas('work_patterns', [
            'type' => 'fixed',
            'work_duration_minutes' => 0,
            'start_time' => null,
            'end_time' => null
        ]);


        $this->assertDatabaseHas('week_patterns', ['name' => 'برنامه اداری جدید']);
    }

    #[Test] public function cannot_create_week_pattern_with_invalid_data()
    {
        // ۱. نام تکراری
        WeekPattern::factory()->create(['name' => 'نام تکراری']);
        $data = $this->createSampleWeekData('نام تکراری');
        $response = $this->postJson(route('week-patterns.store'), $data);
        $response->assertStatus(422)->assertJsonValidationErrors('name');

        // ۲. آرایه روزها ناقص (کمتر از ۷ روز)
        $data = $this->createSampleWeekData('برنامه ناقص');
        unset($data['days'][0]); // حذف شنبه
        $response = $this->postJson(route('week-patterns.store'), $data);
        $response->assertStatus(422)->assertJsonValidationErrors('days');

        // ۳. روز هفته تکراری
        $data = $this->createSampleWeekData('روز تکراری');
        $data['days'][1]['day_of_week'] = 0; // یکشنبه را هم شنبه می‌کنیم
        $response = $this->postJson(route('week-patterns.store'), $data);
        $response->assertStatus(422)->assertJsonValidationErrors(['days.1.day_of_week']); // Expecting error on the second day_of_week
    }

    #[Test] public function can_get_a_single_week_pattern()
    {
        // ۱. ساخت یک الگوی هفتگی نمونه با فکتوری
        $weekPattern = WeekPattern::factory()->create();

        // ۲. ارسال درخواست GET به اندپوینت show
        $response = $this->getJson(route('week-patterns.show', $weekPattern->id));

        // ۳. بررسی پاسخ
        $response->assertStatus(200) // وضعیت ۲۰۰ (OK)
                 ->assertJsonFragment(['id' => $weekPattern->id, 'name' => $weekPattern->name]) // بررسی وجود ID و نام
                 ->assertJsonStructure([
                     // ساختار اصلی WeekPatternResource
                     'data' => [ // اطمینان از وجود کلید data (از JsonResource)
                         'id',
                         'name',
                         'created_at',
                         'updated_at',
                         // بررسی ساختار جزئیات تمام 7 روز هفته
                         'saturday_pattern' => [
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                         'sunday_pattern' => [
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                         'monday_pattern' => [ 
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                         'tuesday_pattern' => [ 
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                         'wednesday_pattern' => [ 
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                         'thursday_pattern' => [ 
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                         'friday_pattern' => [ 
                             'id', 'name', 'type', 'start_time', 'end_time', 'work_duration_minutes'
                         ],
                     ]
                 ]);
    }

    #[Test] public function can_update_a_week_pattern()
    {
        $weekPattern = WeekPattern::factory()->create();
        $data = $this->createSampleWeekData('نام آپدیت شده');
        // تغییر روز شنبه به استراحت
        $data['days'][0] = ['day_of_week' => 0, 'is_working_day' => false, 'start_time' => null, 'end_time' => null, 'work_duration_minutes' => 0];

        $response = $this->putJson(route('week-patterns.update', $weekPattern->id), $data);

        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => 'نام آپدیت شده']);

        // بررسی اینکه شنبه به روز استراحت تغییر کرده است (با فرض اینکه الگوی استراحت ID=X دارد)
        $updatedWeekPattern = WeekPattern::find($weekPattern->id);
        $restPattern = WorkPattern::where('work_duration_minutes', 0)->first();
        $this->assertEquals($restPattern->id, $updatedWeekPattern->saturday_pattern_id);
        $this->assertDatabaseHas('week_patterns', ['id' => $weekPattern->id, 'name' => 'نام آپدیت شده']);
    }

    #[Test] public function cannot_update_week_pattern_with_invalid_data()
    {
        $weekPattern = WeekPattern::factory()->create();
        $otherPattern = WeekPattern::factory()->create(['name' => 'نام دیگر']);

        // ۱. نام تکراری (متعلق به الگوی دیگر)
        $data = $this->createSampleWeekData($otherPattern->name); // استفاده از نام الگوی دیگر
        $response = $this->putJson(route('week-patterns.update', $weekPattern->id), $data);
        $response->assertStatus(422)->assertJsonValidationErrors('name');
    }

    #[Test] public function can_delete_an_unused_week_pattern()
    {
        $weekPattern = WeekPattern::factory()->create();

        $response = $this->deleteJson(route('week-patterns.destroy', $weekPattern->id));

        $response->assertStatus(204);
        $this->assertDatabaseMissing('week_patterns', ['id' => $weekPattern->id]);
    }

    #[Test] public function cannot_delete_a_week_pattern_assigned_to_work_group()
    {
        $weekPattern = WeekPattern::factory()->create();
        WorkGroup::factory()->create(['week_pattern_id' => $weekPattern->id]); // تخصیص به گروه کاری

        $response = $this->deleteJson(route('week-patterns.destroy', $weekPattern->id));

        $response->assertStatus(409); // Conflict
        $this->assertDatabaseHas('week_patterns', ['id' => $weekPattern->id]); // نباید حذف شده باشد
    }

    #[Test] public function cannot_delete_a_week_pattern_assigned_to_employee()
    {
        $weekPattern = WeekPattern::factory()->create();
        Employees::factory()->create(['week_pattern_id' => $weekPattern->id]); // تخصیص مستقیم به کارمند

        $response = $this->deleteJson(route('week-patterns.destroy', $weekPattern->id));

        $response->assertStatus(409); // Conflict
        $this->assertDatabaseHas('week_patterns', ['id' => $weekPattern->id]); // نباید حذف شده باشد
    }
}
