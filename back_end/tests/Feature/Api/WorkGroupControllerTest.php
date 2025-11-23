<?php

use App\Models\Employee;
use App\Models\ShiftSchedule;
use App\Models\User;
use App\Models\WeekPattern;
use App\Models\WorkGroup;
use Database\Seeders\RoleSeeder;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);
uses(\Illuminate\Foundation\Testing\WithFaker::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole('super_admin');

    $this->weekPattern = WeekPattern::factory()->create();
    $this->shiftSchedule = ShiftSchedule::factory()->create();
});

test('can list work groups', function () {
    WorkGroup::factory()->count(5)->create(['week_pattern_id' => $this->weekPattern->id]);

    $this->actingAs($this->superAdmin)
         ->getJson(route('work-groups.index'))
         ->assertOk()
         ->assertJsonCount(5, 'data')
         ->assertJsonStructure([
             'data' => [
                 '*' => ['id', 'name', 'week_pattern_id', 'shift_schedule_id']
             ]
         ]);
});

test('can create work group', function () {
    $data = [
        'name' => 'گروه فنی',
        'week_pattern_id' => $this->weekPattern->id,
        'shift_schedule_id' => $this->shiftSchedule->id
    ];

    $this->actingAs($this->superAdmin)
         ->postJson(route('work-groups.store'), $data)
         ->assertCreated()
         ->assertJsonPath('data.name', $data['name']);

    $this->assertDatabaseHas('work_groups', ['name' => 'گروه فنی']);
});

test('cannot create work group with invalid data', function () {
    $this->actingAs($this->superAdmin)
         ->postJson(route('work-groups.store'), [])
         ->assertUnprocessable()
         ->assertJsonValidationErrors(['name', 'week_pattern_id']);
});

test('can delete work group', function () {
    $workGroup = WorkGroup::factory()->create();

    $this->actingAs($this->superAdmin)
         ->deleteJson(route('work-groups.destroy', $workGroup->id))
         ->assertNoContent(); // 204

    $this->assertDatabaseMissing('work_groups', ['id' => $workGroup->id]);
});

test('cannot delete work group with employees', function () {
    $workGroup = WorkGroup::factory()->create();
    // تخصیص کارمند به این گروه
    Employee::factory()->create(['work_group_id' => $workGroup->id]);

    $this->actingAs($this->superAdmin)
         ->deleteJson(route('work-groups.destroy', $workGroup->id))
         ->assertStatus(409); // Conflict (چون وابسته دارد)

    $this->assertDatabaseHas('work_groups', ['id' => $workGroup->id]);
});

test('unauthorized user cannot access work groups', function () {
    $normalUser = User::factory()->create(); // بدون نقش ادمین

    $this->actingAs($normalUser)
         ->getJson(route('work-groups.index'))
         ->assertForbidden();
});
