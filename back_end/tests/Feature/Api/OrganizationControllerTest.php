<?php

use App\Models\Organization;
use App\Models\User;
use App\Models\Employee;
use Database\Seeders\OrganizationSeeder;
use Database\Seeders\RoleSeeder;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    // در تست‌ها بهتر است به جای سیدر کامل، داده‌های کنترل شده بسازیم
    // اما اگر سیدر دارید از آن استفاده می‌کنیم

    // ساختار درختی دستی برای کنترل بیشتر در تست
    $this->rootOrg = Organization::factory()->create(['name' => 'هلدینگ']);
    $this->childOrg = Organization::factory()->create(['name' => 'معاونت فنی', 'parent_id' => $this->rootOrg->id]);
    $this->grandChildOrg = Organization::factory()->create(['name' => 'واحد نرم‌افزار', 'parent_id' => $this->childOrg->id]);

    // سوپر ادمین
    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole('super_admin');

    // ادمین سطح ۲ (مدیر معاونت فنی) - دسترسی به معاونت فنی و زیرمجموعه‌هایش
    $this->adminL2 = User::factory()->create();
    $this->adminL2->assignRole('org-admin-l2');
    // اتصال ادمین به سازمان (فرض: از طریق جدول employees یا فیلد organization_id در user)
    Employee::factory()->create(['user_id' => $this->adminL2->id, 'organization_id' => $this->childOrg->id]);
});

test('super admin can see all organizations', function () {
    $this->actingAs($this->superAdmin)
         ->getJson('/api/organizations')
         ->assertOk()
         ->assertJsonCount(3, 'data'); // همه ۳ تا را باید ببیند
});

test('admin l2 can only see own organization and children', function () {
    // باید معاونت فنی و واحد نرم‌افزار را ببیند، اما هلدینگ را نه
    $response = $this->actingAs($this->adminL2)
         ->getJson('/api/organizations');

    $response->assertOk();

    // چک کردن اینکه آیدی‌ها شامل فرزندان هست اما پدر نیست
    $ids = collect($response->json('data'))->pluck('id');
    expect($ids)->toContain($this->childOrg->id);
    expect($ids)->toContain($this->grandChildOrg->id);
    expect($ids)->not->toContain($this->rootOrg->id);
});

test('cannot delete organization if it has children', function () {
    // تلاش برای حذف معاونت فنی که فرزند دارد
    $this->actingAs($this->superAdmin)
         ->deleteJson('/api/organizations/' . $this->childOrg->id)
         ->assertUnprocessable() // 422
         ->assertJsonFragment(['message' => 'Cannot delete organization: It has child organizations.']);
         // متن مسیج بسته به کنترلر شماست
});

test('cannot delete organization if it has employees', function () {
    // اضافه کردن کارمند به واحد نرم‌افزار
    Employee::factory()->create(['organization_id' => $this->grandChildOrg->id]);

    $this->actingAs($this->superAdmin)
         ->deleteJson('/api/organizations/' . $this->grandChildOrg->id)
         ->assertStatus(422); // یا 409 Conflict
});

test('admin can create organization', function () {
    $data = [
        'name' => 'واحد جدید',
        'parent_id' => $this->childOrg->id
    ];

    $this->actingAs($this->superAdmin)
         ->postJson('/api/organizations', $data)
         ->assertCreated()
         ->assertJsonPath('data.parent_id', $this->childOrg->id);
});
