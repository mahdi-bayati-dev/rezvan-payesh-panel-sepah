<?php

namespace Tests\Feature\Api;

use App\Models\Employees;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\OrganizationSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Passport\Passport;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class OrganizationControllerTest extends TestCase
{
    use RefreshDatabase;

    // کاربران با سطوح دسترسی مختلف
    protected User $superAdmin;
    protected User $adminL2User;
    protected User $adminL3User;
    protected User $normalUser;

    // سازمان‌هایی که برای تست دسترسی استفاده می‌شوند
    protected Organization $rootOrg;       // سازمان ریشه
    protected Organization $techDeputyOrg; // سازمان ادمین L2 (دارای فرزند)
    protected Organization $adminDeputyOrg; // سازمان "همکار" (Sibling)
    protected Organization $softwareUnitOrg; // سازمان ادمین L3 (فرزند L2)

    protected function setUp(): void
    {
        parent::setUp();

        // 1. اجرای سیدرهای حیاتی
        $this->seed(RoleSeeder::class);
        $this->seed(OrganizationSeeder::class); // سیدری که ساختار درختی را ایجاد می‌کند

        // 2. پیدا کردن سازمان‌های کلیدی از سیدر
        $this->rootOrg = Organization::where('name', 'شرکت مادر (هلدینگ)')->firstOrFail();
        $this->techDeputyOrg = Organization::where('name', 'معاونت فنی و مهندسی')->firstOrFail();
        $this->adminDeputyOrg = Organization::where('name', 'معاونت اداری و مالی')->firstOrFail();
        $this->softwareUnitOrg = Organization::where('name', 'واحد نرم‌افزار')->firstOrFail();

        // 3. ساخت کاربران با نقش‌ها و سازمان‌های مشخص

        // سوپر ادمین (بدون سازمان خاص)
        $this->superAdmin = User::factory()->create();
        $this->superAdmin->assignRole('super_admin');

        // ادمین L2 (مدیر معاونت فنی)
        $this->adminL2User = User::factory()->create();
        $this->adminL2User->assignRole('org-admin-l2');
        Employees::factory()->create([
            'user_id' => $this->adminL2User->id,
            'organization_id' => $this->techDeputyOrg->id
        ]);
        $this->adminL2User->load('employee.organization'); // پالیسی به این آبجکت نیاز دارد

        // ادمین L3 (مدیر واحد نرم‌افزار)
        $this->adminL3User = User::factory()->create();
        $this->adminL3User->assignRole('org-admin-l3');
        Employees::factory()->create([
            'user_id' => $this->adminL3User->id,
            'organization_id' => $this->softwareUnitOrg->id
        ]);
        $this->adminL3User->load('employee.organization');

        // کاربر عادی
        $this->normalUser = User::factory()->create();
        $this->normalUser->assignRole('user');
    }

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // تست‌های احراز هویت و دسترسی عمومی
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

    #[Test] public function organization_routes_are_protected_by_auth_api()
    {
        $this->getJson('/api/organizations')->assertStatus(401); // Unauthorized
    }

    #[Test] public function normal_user_cannot_access_organization_routes()
    {
        Passport::actingAs($this->normalUser);

        $this->getJson('/api/organizations')->assertStatus(403); // Forbidden
        $this->getJson('/api/organizations/' . $this->rootOrg->id)->assertStatus(403);
        $this->postJson('/api/organizations', ['name' => 'Test'])->assertStatus(403);
    }

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // تست‌های Super Admin (دسترسی کامل)
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

    #[Test] public function super_admin_can_index_full_organization_tree()
    {
        Passport::actingAs($this->superAdmin);

        $response = $this->getJson('/api/organizations');

        // بر اساس منطق کنترلر، سوپر ادمین کل درخت را می‌گیرد
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'name',
                             'children'
                         ]
                     ]
                 ])
                 ->assertJsonCount(1, 'data'); // فقط 1 ریشه (هلدینگ)

        // چک می‌کنیم که زیرمجموعه (معاونت فنی) در داخل ریشه لود شده باشد
        $response->assertJsonFragment(['name' => $this->techDeputyOrg->name]);
    }

    #[Test] public function super_admin_can_store_a_new_root_organization()
    {
        Passport::actingAs($this->superAdmin);

        $payload = ['name' => 'سازمان ریشه جدید', 'parent_id' => null];

        $response = $this->postJson('/api/organizations', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'سازمان ریشه جدید']);

        $this->assertDatabaseHas('organizations', $payload);
    }

    #[Test] public function super_admin_can_store_a_child_organization()
    {
        Passport::actingAs($this->superAdmin);

        $payload = ['name' => 'فرزند جدید برای ریشه', 'parent_id' => $this->rootOrg->id];

        $this->postJson('/api/organizations', $payload)
             ->assertStatus(201);

        $this->assertDatabaseHas('organizations', $payload);
    }

    #[Test] public function super_admin_can_update_organization()
    {
        Passport::actingAs($this->superAdmin);

        $payload = ['name' => 'نام ویرایش شده'];

        $this->putJson('/api/organizations/' . $this->softwareUnitOrg->id, $payload)
             ->assertStatus(200)
             ->assertJsonFragment($payload);

        $this->assertDatabaseHas('organizations', $payload);
    }

    #[Test] public function super_admin_can_delete_organization()
    {
        // یک سازمان بدون فرزند و کارمند می‌سازیم تا قابل حذف باشد
        $orgToDelete = Organization::factory()->create(['parent_id' => $this->rootOrg->id]);

        Passport::actingAs($this->superAdmin);

        $this->deleteJson('/api/organizations/' . $orgToDelete->id)
             ->assertStatus(204); // No Content

        $this->assertDatabaseMissing('organizations', ['id' => $orgToDelete->id]);
    }

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // تست‌های Admin L2 (دسترسی محدود به شاخه خود)
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

    #[Test] public function admin_l2_can_index_only_own_branch()
    {
        Passport::actingAs($this->adminL2User);

        $response = $this->getJson('/api/organizations');

        // بر اساس منطق کنترلر، L2 فقط سازمان خود (با نوادگان) را می‌بیند
        $response->assertStatus(200)
                 ->assertJsonStructure([ // یک آبجکت تکی برمی‌گردد، نه آرایه
                     'data' => [
                         'id',
                         'name',
                         'descendants'
                     ]
                 ])
                 ->assertJsonFragment(['name' => $this->techDeputyOrg->name]) // سازمان خودش
                 ->assertJsonFragment(['name' => $this->softwareUnitOrg->name]); // فرزندش

        // *نباید* سازمان همکار (اداری و مالی) را ببیند
        $response->assertJsonMissing(['name' => $this->adminDeputyOrg->name]);
    }

    #[Test] public function admin_l2_can_show_own_org_and_descendants()
    {
        Passport::actingAs($this->adminL2User);

        // 1. مشاهده سازمان خود (L2)
        $this->getJson('/api/organizations/' . $this->techDeputyOrg->id)
             ->assertStatus(200);

        // 2. مشاهده سازمان زیرمجموعه (L3)
        $this->getJson('/api/organizations/' . $this->softwareUnitOrg->id)
             ->assertStatus(200);
    }

    #[Test] public function admin_l2_cannot_show_sibling_or_ancestor_orgs()
    {
        Passport::actingAs($this->adminL2User);

        // 1. عدم مشاهده سازمان همکار (Sibling)
        $this->getJson('/api/organizations/' . $this->adminDeputyOrg->id)
             ->assertStatus(403); // Forbidden

        // 2. عدم مشاهده سازمان والد (Ancestor)
        $this->getJson('/api/organizations/' . $this->rootOrg->id)
             ->assertStatus(403);
    }

    #[Test] public function admin_l2_cannot_create_update_or_delete_orgs()
    {
        Passport::actingAs($this->adminL2User);

        // تست Create (طبق پالیسی شما false است)
        $this->postJson('/api/organizations', ['name' => 'تست L2', 'parent_id' => $this->techDeputyOrg->id])
             ->assertStatus(403);

        // تست Update (طبق پالیسی شما false است)
        $this->putJson('/api/organizations/' . $this->techDeputyOrg->id, ['name' => 'تست L2'])
             ->assertStatus(403);

        // تست Delete (طبق پالیسی شما false است)
        $this->deleteJson('/api/organizations/' . $this->softwareUnitOrg->id)
             ->assertStatus(403);
    }

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // تست‌های Admin L3 (دسترسی محدود فقط به خود)
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

    #[Test] public function admin_l3_can_index_only_own_org()
    {
        Passport::actingAs($this->adminL3User);

        $response = $this->getJson('/api/organizations');

        // بر اساس منطق کنترلر، L3 فقط سازمان خود (بدون نوادگان) را می‌بیند
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'id',
                         'name'
                     ]
                 ])
                 ->assertJsonFragment(['name' => $this->softwareUnitOrg->name]) // سازمان خودش
                 ->assertJsonMissing(['name' => $this->techDeputyOrg->name]); // *نباید* والدش را ببیند
    }

    #[Test] public function admin_l3_can_show_only_own_org()
    {
        Passport::actingAs($this->adminL3User);

        // 1. مشاهده سازمان خود
        $this->getJson('/api/organizations/' . $this->softwareUnitOrg->id)
             ->assertStatus(200);

        // 2. عدم مشاهده سازمان والد (Ancestor)
        $this->getJson('/api/organizations/' . $this->techDeputyOrg->id)
             ->assertStatus(403); // Forbidden

        // 3. عدم مشاهده سازمان ریشه
        $this->getJson('/api/organizations/' . $this->rootOrg->id)
             ->assertStatus(403);
    }

    #[Test] public function admin_l3_cannot_create_update_or_delete_orgs()
    {
        Passport::actingAs($this->adminL3User);

        $this->postJson('/api/organizations', ['name' => 'تست L3'])->assertStatus(403);
        $this->putJson('/api/organizations/' . $this->softwareUnitOrg->id, ['name' => 'تست L3'])->assertStatus(403);
        $this->deleteJson('/api/organizations/' . $this->softwareUnitOrg->id)->assertStatus(403);
    }

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // تست‌های منطق بیزینس (Business Logic)
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

    #[Test] public function cannot_delete_organization_if_it_has_children()
    {
        Passport::actingAs($this->superAdmin);

        // معاونت فنی فرزند دارد (واحد نرم‌افزار)
        $this->deleteJson('/api/organizations/' . $this->techDeputyOrg->id)
             ->assertStatus(422) // Unprocessable Entity
             ->assertJsonFragment(['message' => 'Cannot delete organization: It has child organizations.']);
    }

    #[Test] public function cannot_delete_organization_if_it_has_employees()
    {
        Passport::actingAs($this->superAdmin);

        // ادمین L3 به واحد نرم‌افزار متصل است، پس این سازمان کارمند دارد
        $this->deleteJson('/api/organizations/' . $this->softwareUnitOrg->id)
             ->assertStatus(422)
             ->assertJsonFragment(['message' => 'Cannot delete organization: It has assigned employees.']);
    }
}