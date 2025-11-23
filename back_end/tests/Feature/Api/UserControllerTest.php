<?php

use App\Models\Organization;
use App\Models\User;
use App\Models\Employee;
use Database\Seeders\RoleSeeder;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);
uses(\Illuminate\Foundation\Testing\WithFaker::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    $this->org = Organization::factory()->create();

    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole('super_admin');

    $this->orgAdmin = User::factory()->create();
    $this->orgAdmin->assignRole('org-admin-l2');
    Employee::factory()->create(['user_id' => $this->orgAdmin->id, 'organization_id' => $this->org->id]);
});

test('guest cannot list users', function () {
    $this->getJson(route('users.index'))
         ->assertUnauthorized();
});

test('super admin can create user with employee details', function () {
    $payload = getUserPayload('user', $this->org->id);

    $this->actingAs($this->superAdmin)
         ->postJson(route('users.store'), $payload)
         ->assertCreated()
         ->assertJsonPath('data.username', $payload['username'])
         ->assertJsonPath('data.employee.organization_id', $this->org->id);

    $this->assertDatabaseHas('users', ['username' => $payload['username']]);
    $this->assertDatabaseHas('employees', ['personnel_code' => $payload['employee']['personnel_code']]);
});

test('admin cannot create user with invalid organization', function () {
    $payload = getUserPayload('user', 99999); // آیدی نامعتبر

    $this->actingAs($this->superAdmin)
         ->postJson(route('users.store'), $payload)
         ->assertUnprocessable()
         ->assertJsonValidationErrors('employee.organization_id');
});

test('admin l2 can create normal user in own org', function () {
    // ادمین سازمان باید بتواند در سازمان خودش کاربر بسازد
    $payload = getUserPayload('user', $this->org->id);

    $this->actingAs($this->orgAdmin)
         ->postJson(route('users.store'), $payload)
         ->assertCreated();
});

// --- توابع کمکی (Helpers) در فایل Pest به صورت ساده تعریف می‌شوند ---

function getUserPayload(string $role, int $orgId): array
{
    $user = User::factory()->make();
    $employee = Employee::factory()->make([
        'organization_id' => $orgId
    ]);

    return [
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'username' => $user->username,
        'password' => 'password',
        'password_confirmation' => 'password',
        'roles' => [$role],
        'employee' => [
            'personnel_code' => $employee->personnel_code,
            'organization_id' => $orgId,
            'national_code' => $employee->national_code,
            // سایر فیلدهای الزامی Employee
        ]
    ];
}
