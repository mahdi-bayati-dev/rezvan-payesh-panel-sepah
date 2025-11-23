<?php

use App\Models\Holiday;
use App\Models\User;
use Illuminate\Support\Carbon;
use Database\Seeders\RoleSeeder;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);
uses(\Illuminate\Foundation\Testing\WithFaker::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    $this->adminUser = User::factory()->create();
    $this->adminUser->assignRole('super_admin');

    $this->normalUser = User::factory()->create();
});

test('admin can list holidays', function () {
    Holiday::factory()->create(['date' => Carbon::now()->addDays(2)->toDateString()]);
    $holidayInRange = Holiday::factory()->create(['date' => Carbon::now()->addDays(10)->toDateString()]);
    Holiday::factory()->create(['date' => Carbon::now()->addDays(20)->toDateString()]);

    $this->actingAs($this->adminUser)
         ->getJson(route('holidays.index'))
         ->assertOk()
         ->assertJsonCount(3, 'data');

    // تست فیلتر تاریخ
    $startDate = Carbon::now()->addDays(5)->toDateString();
    $endDate = Carbon::now()->addDays(15)->toDateString();

    $this->actingAs($this->adminUser)
         ->getJson(route('holidays.index', ['start_date' => $startDate, 'end_date' => $endDate]))
         ->assertOk()
         ->assertJsonCount(1, 'data')
         ->assertJsonPath('data.0.date', $holidayInRange->date->format('Y-m-d'));
});

test('normal user cannot list holidays', function () {
    $this->actingAs($this->normalUser)
         ->getJson(route('holidays.index'))
         ->assertForbidden();
});

test('admin can create holiday', function () {
    $date = Carbon::now()->addMonth()->startOfMonth()->toDateString();
    $data = [
        'date' => $date,
        'name' => 'تعطیلی اول ماه بعد',
        'is_official' => true
    ];

    $this->actingAs($this->adminUser)
         ->postJson(route('holidays.store'), $data)
         ->assertCreated()
         ->assertJsonPath('data.name', $data['name']);

    $this->assertDatabaseHas('holidays', ['date' => $date]);
});

test('create holiday validation fails', function () {
    // تاریخ تکراری
    $existing = Holiday::factory()->create();

    $this->actingAs($this->adminUser)
         ->postJson(route('holidays.store'), [
             'date' => $existing->date->format('Y-m-d'),
             'name' => 'تکراری'
         ])
         ->assertUnprocessable()
         ->assertJsonValidationErrors('date');
});

test('admin can delete holiday', function () {
    $holiday = Holiday::factory()->create();

    $this->actingAs($this->adminUser)
         ->deleteJson(route('holidays.destroy', $holiday->date->format('Y-m-d')))
         ->assertNoContent();

    $this->assertDatabaseMissing('holidays', ['id' => $holiday->id]);
});