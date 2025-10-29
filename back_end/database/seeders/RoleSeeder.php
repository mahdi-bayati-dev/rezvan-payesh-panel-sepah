<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        Role::create(['name' => 'org-admin-l2', 'guard_name' => 'api']);
        Role::create(['name' => 'org-admin-l3', 'guard_name' => 'api']);
        Role::create(['name' => 'user', 'guard_name' => 'api']);
        Permission::create(['name' => 'create config']);
        Permission::create(['name' => 'leader']);
//        Permission::create(['name' => 'delete articles']);
//        Permission::create(['name' => 'publish articles']);
//        Permission::create(['name' => 'manage users']);
        $super_admin = Role::create(['name' => 'super_admin', 'guard_name' => 'api']);
        $super_admin->givePermissionTo(Permission::all());
    }
}
