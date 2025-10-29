<?php

namespace Tests\Feature\Api;

use App\Models\Employees;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Auth;
use Laravel\Passport\Passport;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;

class UserControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;
    protected Role $superAdminRole;
    protected Role $adminL2Role;
    protected Role $adminL3Role;
    protected Role $userRole;

    protected Organization $orgL1; // سازمان اصلی
    protected Organization $orgL2; // زیرمجموعه L1
    protected Organization $orgL3; // زیرمجموعه L2
    protected Organization $otherOrg;

    protected User $superAdmin;
    protected User $adminL2;
    protected User $adminL3;
    protected User $normalUserInL3;
    protected User $userInOtherOrg;



    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class]);

        // 2. ساخت ساختار سازمانی
        $this->orgL1 = Organization::factory()->create(['name' => 'Org L1']);
        $this->orgL2 = Organization::factory()->childOf($this->orgL1)->create(['name' => 'Org L2']);
        $this->orgL3 = Organization::factory()->childOf($this->orgL2)->create(['name' => 'Org L3']);
        $this->otherOrg = Organization::factory()->create(['name' => 'Other Org']);

        // 3. ساخت کاربران با نقش‌ها و سازمان‌های مختلف
        $this->superAdmin = $this->createUserWithEmployee('super_admin'); // Super Admin (بدون سازمان مشخص لازم است؟)
        $this->adminL2 = $this->createUserWithEmployee('org-admin-l2', $this->orgL2); // ادمین L2 در Org L2
        $this->adminL3 = $this->createUserWithEmployee('org-admin-l3', $this->orgL3); // ادمین L3 در Org L3
        $this->normalUserInL3 = $this->createUserWithEmployee('user', $this->orgL3); // کاربر عادی در Org L3
        $this->userInOtherOrg = $this->createUserWithEmployee('user', $this->otherOrg); // کاربر عادی در سازمان دیگر


    }

    // Helper function to create user with employee profile
    private function createUserWithEmployee(string $roleName, Organization $organization = null): User
    {
        $user = User::factory()->create();
        Employees::factory()->create([
            'user_id' => $user->id,
            'organization_id' => $organization?->id,
        ]);
        $user->assignRole($roleName);
        return $user->refresh();
    }


    // --- تست‌های Index ---

    #[Test] public function super_admin_can_list_all_users(): void
    {
        Passport::actingAs($this->superAdmin);
        $response = $this->getJson(route('users.index'));
        $response->assertStatus(200)
                 ->assertJsonCount(5, 'data'); // باید همه ۵ کاربر ساخته شده را ببیند
    }

    #[Test]
    public function admin_l2_can_list_users_in_own_org_and_descendants(): void
    {
        Passport::actingAs($this->adminL2);
        $response = $this->getJson(route('users.index'));

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data'); // فقط ۲ کاربر دیگر (نه خودش)

        $data = $response->json('data');
        $userIds = collect($data)->pluck('id');

        $this->assertFalse($userIds->contains($this->adminL2->id), 'Should not see self');
        $this->assertFalse($userIds->contains($this->superAdmin->id), 'Should not see super admin');
        $this->assertFalse($userIds->contains($this->userInOtherOrg->id), 'Should not see user in other org');
        $this->assertTrue($userIds->contains($this->adminL3->id), 'Should see admin L3 in descendant org');
        $this->assertTrue($userIds->contains($this->normalUserInL3->id), 'Should see normal user in descendant org');
    }

    #[Test]
    public function admin_l2_cannot_see_self_in_user_list(): void
    {
        Passport::actingAs($this->adminL2);
        $response = $this->getJson(route('users.index'));

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');

        // بررسی اینکه آرایه data شامل id کاربر جاری نیست
        $data = $response->json('data');
        $userIds = collect($data)->pluck('id');

        $this->assertFalse($userIds->contains($this->adminL2->id), 'Admin L2 should not see themselves in the list');
        $this->assertTrue($userIds->contains($this->adminL3->id));
        $this->assertTrue($userIds->contains($this->normalUserInL3->id));
    }

    #[Test] public function admin_l3_can_list_users_in_own_org_only(): void
    {
        Passport::actingAs($this->adminL3); // لاگین به عنوان ادمین L3 (سازمان Org L3)
        $response = $this->getJson(route('users.index'));

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data') // فقط کاربر عادی در Org L3 را باید ببیند
                 ->assertJsonPath('data.0.id', $this->normalUserInL3->id)
                 ->assertJsonMissing(['id' => $this->adminL3->id]); // خودش را نباید ببیند؟
    }

    #[Test] public function normal_user_cannot_list_users(): void
    {
        Passport::actingAs($this->normalUserInL3);
        $response = $this->getJson(route('users.index'));
        $response->assertStatus(403); // Forbidden
    }

    // --- تست‌های Store ---

    #[Test] public function super_admin_can_create_any_user_in_any_org(): void
    {
        Passport::actingAs($this->superAdmin);
        $data = $this->getUserPayload('org-admin-l2', $this->orgL1->id); // ایجاد ادمین L2 در Org L1
        $response = $this->postJson(route('users.store'), $data);
        $response->assertStatus(201)
                 ->assertJsonPath('data.roles.0', 'org-admin-l2')
                 ->assertJsonPath('data.employee.organization.id', $this->orgL1->id);
        $this->assertDatabaseHas('users', ['email' => $data['email']]);
    }

    #[Test] public function admin_l2_can_create_normal_user_in_own_scope(): void
    {
        Passport::actingAs($this->adminL2); // ادمین L2 در Org L2
        $data = $this->getUserPayload('user', $this->orgL3->id); // ایجاد کاربر عادی در Org L3 (زیرمجموعه)
        $response = $this->postJson(route('users.store'), $data);
        $response->assertStatus(201)
                 ->assertJsonPath('data.roles.0', 'user')
                 ->assertJsonPath('data.employee.organization.id', $this->orgL3->id);
    }

    #[Test] public function admin_l2_cannot_create_admin_user(): void
    {
        Passport::actingAs($this->adminL2);
        $data = $this->getUserPayload('org-admin-l3', $this->orgL3->id); // تلاش برای ایجاد ادمین L3
        $response = $this->postJson(route('users.store'), $data);
        $response->assertStatus(422) // خطای ولیدیشن نقش
                 ->assertJsonValidationErrors('role');
    }

    #[Test] public function admin_l2_cannot_create_user_outside_scope(): void
    {
        Passport::actingAs($this->adminL2); // ادمین L2 در Org L2
        $data = $this->getUserPayload('user', $this->otherOrg->id); // تلاش برای ایجاد کاربر در سازمان نامرتبط
        $response = $this->postJson(route('users.store'), $data);
        $response->assertStatus(403); // Forbidden Scope
    }

    // ... تست‌های مشابه برای admin_l3 ...

    // --- تست‌های Show ---

    #[Test] public function admin_l2_can_show_user_in_scope(): void
    {
        Passport::actingAs($this->adminL2);
        $response = $this->getJson(route('users.show', $this->normalUserInL3->id));
        $response->assertStatus(200)
                 ->assertJsonPath('data.id', $this->normalUserInL3->id);
    }

    #[Test] public function admin_l2_cannot_show_user_outside_scope(): void
    {
        Passport::actingAs($this->adminL2);
        $response = $this->getJson(route('users.show', $this->userInOtherOrg->id));
        $response->assertStatus(403); // Policy باید رد کند
    }

    #[Test] public function user_can_show_own_profile(): void
    {
        Passport::actingAs($this->normalUserInL3);
        $response = $this->getJson(route('users.show', $this->normalUserInL3->id));
        $response->assertStatus(200)
                 ->assertJsonPath('data.id', $this->normalUserInL3->id);
    }

    #[Test] public function user_cannot_show_other_profile(): void
    {
        Passport::actingAs($this->normalUserInL3);
        $response = $this->getJson(route('users.show', $this->adminL3->id));
        $response->assertStatus(403);
    }

    // --- تست‌های Update ---

    #[Test] public function super_admin_can_update_any_user_role_and_org(): void
    {
        Passport::actingAs($this->superAdmin);
        $response = $this->putJson(route('users.update', $this->normalUserInL3->id), [
            'user_name' => 'Updated Name',
            'role' => 'org-admin-l3', // ارتقا نقش
            'employee' => [
                'organization_id' => $this->orgL2->id, // تغییر سازمان
            ]
        ]);
        $response->assertStatus(200)
                 ->assertJsonPath('data.user_name', 'Updated Name')
                 ->assertJsonPath('data.roles.0', 'org-admin-l3')
                 ->assertJsonPath('data.employee.organization.id', $this->orgL2->id);
    }

    #[Test] public function admin_l2_can_update_normal_user_in_scope_but_not_role_or_org(): void
    {
        Passport::actingAs($this->adminL2); // ادمین L2 در Org L2
         $response = $this->putJson(route('users.update', $this->normalUserInL3->id), [
            'user_name' => 'Updated By L2',
            'employee' => [
                'first_name' => 'Updated First Name',
            ]
        ]);
        $response->assertStatus(200)
                 ->assertJsonPath('data.user_name', 'Updated By L2')
                 ->assertJsonPath('data.employee.first_name', 'Updated First Name');

         // تلاش برای تغییر نقش (باید توسط ولیدیشن رد شود)
        $response = $this->putJson(route('users.update', $this->normalUserInL3->id), [
            'role' => 'org-admin-l3',
        ]);
        $response->assertStatus(422)->assertJsonValidationErrors('role');


         // تلاش برای تغییر سازمان (باید توسط ولیدیشن رد شود)
        $response = $this->putJson(route('users.update', $this->normalUserInL3->id), [
            'employee' => [
                'organization_id' => $this->orgL2->id,
            ]
        ]);
         $response->assertStatus(422)->assertJsonValidationErrors('employee.organization_id');
    }

    #[Test] public function admin_l2_cannot_update_another_admin(): void
    {
        Passport::actingAs($this->adminL2);
         // تلاش برای ویرایش adminL3 (که در scope هست اما ادمینه)
        $response = $this->putJson(route('users.update', $this->adminL3->id), [
            'user_name' => 'Try Update Admin',
        ]);
        $response->assertStatus(403); // Policy باید رد کند
    }

    #[Test] public function user_can_update_own_profile_but_not_role_or_org(): void
    {
        Passport::actingAs($this->normalUserInL3);
         $response = $this->putJson(route('users.update', $this->normalUserInL3->id), [
            'user_name' => 'My Updated Name',
            'password' => 'newpassword123',
            'employee' => ['first_name' => 'MyNewFirstName']
        ]);
        $response->assertStatus(200)->assertJsonPath('data.user_name', 'My Updated Name');
        $this->assertTrue(Hash::check('newpassword123', $this->normalUserInL3->refresh()->password));

         // تلاش برای تغییر نقش خود
        $response = $this->putJson(route('users.update', $this->normalUserInL3->id), ['role' => 'org-admin-l3']);
        $response->assertStatus(422)->assertJsonValidationErrors('role');

        // تلاش برای تغییر سازمان خود
         $response = $this->putJson(route('users.update', $this->normalUserInL3->id), ['employee' => ['organization_id' => $this->orgL2->id]]);
         $response->assertStatus(422)->assertJsonValidationErrors('employee.organization_id');
    }

    // --- تست‌های Delete ---

    #[Test] public function super_admin_can_delete_any_user_except_self(): void
    {
        Passport::actingAs($this->superAdmin);
        $response = $this->deleteJson(route('users.destroy', $this->adminL2->id));
        $response->assertStatus(204);
        $this->assertSoftDeleted('users', [
            'id' => $this->adminL2->id
        ]);

         // تلاش برای حذف خود
        $response = $this->deleteJson(route('users.destroy', $this->superAdmin->id));
        $response->assertStatus(403); // Controller باید جلوی حذف خود را بگیرد
        $this->assertNotSoftDeleted('users', [
            'id' => $this->superAdmin->id
        ]);
    }

    #[Test] public function admin_l2_can_delete_normal_user_in_scope(): void
    {
        Passport::actingAs($this->adminL2);
        $response = $this->deleteJson(route('users.destroy', $this->normalUserInL3->id));
        $response->assertStatus(204);
        $this->assertSoftDeleted('users', [
            'id' => $this->normalUserInL3->id
        ]);
    }

    #[Test] public function admin_l2_cannot_delete_admin_user_in_scope(): void
    {
         Passport::actingAs($this->adminL2);
         // تلاش برای حذف adminL3
        $response = $this->deleteJson(route('users.destroy', $this->adminL3->id));
        $response->assertStatus(403); // Policy باید رد کند
    }

    #[Test] public function admin_l2_cannot_delete_user_outside_scope(): void
    {
        Passport::actingAs($this->adminL2);
        $response = $this->deleteJson(route('users.destroy', $this->userInOtherOrg->id));
        $response->assertStatus(403); // Policy باید رد کند
    }

    #[Test] public function user_cannot_delete_anyone(): void
    {
        Passport::actingAs($this->normalUserInL3);
        // تلاش برای حذف خود
        $response = $this->deleteJson(route('users.destroy', $this->normalUserInL3->id));
        $response->assertStatus(403);
        // تلاش برای حذف دیگری
        $response = $this->deleteJson(route('users.destroy', $this->adminL3->id));
        $response->assertStatus(403);
    }
    #[Test]
    public function soft_deleted_user_cannot_be_retrieved_or_updated(): void
    {
        // اول کاربر را حذف کن
        $this->adminL2->delete();
        $this->assertSoftDeleted($this->adminL2);

        Passport::actingAs($this->superAdmin);

        // نباید در لیست بیاید
        $this->getJson(route('users.index'))
            ->assertStatus(200)
            ->assertJsonMissing(['id' => $this->adminL2->id]);

        // نباید Show شود (باید 404 بدهد)
        $this->getJson(route('users.show', $this->adminL2->id))->assertStatus(404);

        // نباید Update شود (باید 404 بدهد)
        $this->putJson(route('users.update', $this->adminL2->id), ['user_name' => 'Ghost'])
            ->assertStatus(404);

        // نباید دوباره Delete شود (بسته به پیاده‌سازی، 404 یا 204)
        $this->deleteJson(route('users.destroy', $this->adminL2->id))->assertStatus(404);
    }

    #[Test]
    public function soft_deleted_user_cannot_login(): void
    {
        // این تست به لاجیک Auth شما بستگی دارد، اما فرض کلی این است
        $password = 'password123';
        $user = $this->createUserWithEmployee('user', $this->orgL3, $password);

        $user->delete(); // کاربر را حذف کن
        $this->assertSoftDeleted($user);

        // تلاش برای لاگین با Passport (یا Sanctum)
        $response = $this->postJson(route('passport.token'), [ // یا هر روت لاگین دیگری که دارید
            'username' => $user->email,
            'password' => $password,
        ]);

        // باید 400 (Invalid Request) یا 401 (Unauthorized) بدهد، نه 200
        $response->assertStatus(400);
        // یا اگر لاجیک لاگین شما ایمیل و پسورد را چک می‌کند و بعد
        // کاربر را برمی‌گرداند و *بعد* می‌بیند حذف شده، شاید 401/403 بدهد.
    }
    #[Test]
    public function store_user_fails_with_duplicate_email(): void
    {
        Passport::actingAs($this->superAdmin);

        // یک کاربر با ایمیل موجود $this->adminL2->email بساز
        $data = $this->getUserPayload('user', $this->orgL1->id);
        $data['email'] = $this->adminL2->email; // استفاده از ایمیل تکراری

        $response = $this->postJson(route('users.store'), $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    #[Test]
    public function store_user_fails_with_non_existent_organization(): void
    {
        Passport::actingAs($this->superAdmin);

        $data = $this->getUserPayload('user', 9999); // ID سازمانی که وجود ندارد

        $response = $this->postJson(route('users.store'), $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('employee.organization_id');
    }

    #[Test]
    public function guest_cannot_list_users(): void
    {

        $response = $this->getJson(route('users.index'));
        $response->assertStatus(401); // Unauthorized
    }

    #[Test]
    public function admin_l2_can_create_normal_user_in_OWN_org(): void
    {
        Passport::actingAs($this->adminL2); // ادمین L2 در Org L2

        // ایجاد کاربر عادی در Org L2 (دقیقا سازمان خودش)
        $data = $this->getUserPayload('user', $this->orgL2->id);

        $response = $this->postJson(route('users.store'), $data);
        $response->assertStatus(201)
            ->assertJsonPath('data.roles.0', 'user')
            ->assertJsonPath('data.employee.organization.id', $this->orgL2->id);
    }

    // --- Helper for Payload ---
    private function getUserPayload(string $role, int $orgId): array
    {
        $userData = User::factory()
            ->make()
            ->toArray();

        $employeeData = Employees::factory()
            ->forOrganization($orgId)
            ->forRole($role)
            ->withRequiredFields()
            ->make()
            ->toArray();

        return [
            'user_name' => $userData['user_name'],
            'email' => $userData['email'],
            'password' => 'password',
            'role' => $role,
            'status' => 'active',
            'employee' => $employeeData
        ];
    }


}
