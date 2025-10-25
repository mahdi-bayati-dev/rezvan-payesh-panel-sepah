<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $user = $request->user();
        $userEmployeeProfile = $user->employees;

        $query = User::with(['employee.organization', 'roles']);

        // 3. Apply Scope Filtering based on Role
        if ($user->hasRole('org-admin-l2'))
        {
            if ($userEmployeeProfile?->organization)
            {
                 $adminOrg = $userEmployeeProfile->organization;
                 // دریافت ID های سازمان ادمین و تمام زیرمجموعه‌ها
                 $allowedOrgIds = $adminOrg->descendants()->pluck('id')->push($adminOrg->id);
                 $query->whereHas('employee', function ($q) use ($allowedOrgIds) {
                     $q->whereIn('organization_id', $allowedOrgIds);
                 });
            }
            else
            {
                 $query->whereRaw('1 = 0'); // ادمین L2 بدون سازمان، کسی را نبیند
            }
        }
        elseif ($user->hasRole('org-admin-l3'))
        {
            if ($userEmployeeProfile?->organization_id)
            {
                // ادمین L3 فقط کاربران سازمان خودش را می‌بیند
                 $query->whereHas('employee', function ($q) use ($userEmployeeProfile)
                 {
                     $q->where('organization_id', $userEmployeeProfile->organization_id);
                 });
            }
            else
            {
                  $query->whereRaw('1 = 0'); // ادمین L3 بدون سازمان، کسی را نبیند
            }
        }
        $users = $query->paginate(15);

        return new UserCollection($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $creatingUser = $request->user();
        $creatingUserEmployee = $creatingUser->employee;

        $validator = Validator::make($request->all(), [
            // User fields
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', 'string', Rule::exists('roles', 'name')], // نقش باید وجود داشته باشد
            'status' => ['required', 'string', Rule::in(['active', 'inactive'])],

            // Employee fields
            'employee.first_name' => ['required', 'string', 'max:255'],
            'employee.last_name' => ['required', 'string', 'max:255'],
            'employee.personnel_code' => ['required', 'string', 'max:50', 'unique:employees,personnel_code'],
            'employee.organization_id' => ['required', 'integer', Rule::exists('organizations', 'id')],
            'employee.position' => ['nullable', 'string', 'max:255'],
            'employee.starting_job' => ['nullable', 'date'],


            // اطلاعات شخصی
            'employee.father_name' => ['nullable', 'string', 'max:255'],
            'employee.birth_date' => ['nullable', 'date', 'before_or_equal:today'],
            'employee.nationality_code' => ['nullable', 'string', 'max:20', 'unique:employees,nationality_code'],
            'employee.gender' => ['required', 'string', Rule::in(['male', 'female'])],
            'employee.is_married' => ['required', 'boolean'],
            'employee.education_level' => ['nullable', 'string',Rule::in(['diploma','advanced_diploma', 'bachelor', 'master','doctorate','post_doctorate']), 'max:255'],

            // اطلاعات تماس
            'employee.phone_number' => ['nullable', 'string', 'max:20', 'unique:employees,phone_number'],
            'employee.house_number' => ['nullable', 'string', 'max:50'],
            'employee.sos_number' => ['nullable', 'string', 'max:20'], // (شماره تماس اضطراری)
            'employee.address' => ['nullable', 'string', 'max:1000'],

            // اطلاعات برنامه کاری (معمولاً این فیلدها nullable هستند چون ممکن است از گروه کاری ارث‌بری شوند)
            'employee.work_group_id' => ['nullable', 'integer', Rule::exists('work_groups', 'id')],
            'employee.shift_schedule_id' => ['nullable', 'integer', Rule::exists('shift_schedules', 'id')],
            'employee.work_pattern_id' => ['nullable', 'integer', Rule::exists('work_patterns', 'id')],
        ]);

        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        $employeeData = $validatedData['employee'];
        $targetOrgId = $employeeData['organization_id'];
        $targetRoleName = $validatedData['role'];

        // 3. Authorize Scope: آیا ادمین اجازه ایجاد کاربر در این سازمان و با این نقش را دارد؟
        if (!$this->canAdminManageOrg($creatingUser, $targetOrgId))
        {
             return response()->json(['message' => 'Unauthorized scope for organization.'], 403);
        }
        if (!$this->canAdminAssignRole($creatingUser, $targetRoleName))
        {
             return response()->json(['message' => 'Unauthorized role assignment.'], 403);
        }
        // 4. Create User and Employee in Transaction
        $user = DB::transaction(function () use ($validatedData, $employeeData, $targetRoleName) {
            $user = User::create([
                'user_name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'status' => $validatedData['status'],
            ]);

            $user->employeess()->create([
                'first_name' => $employeeData['first_name'],
                'last_name' => $employeeData['last_name'],
                'personnel_code' => $employeeData['personnel_code'],
                'organization_id' => $employeeData['organization_id'],
                'position' => $employeeData['position'] ?? null,
                'starting_job' => $employeeData['starting_job'] ?? null,


                // اطلاعات شخصی
                'father_name' => $employeeData['father_name'] ?? null,
                'birth_date' => $employeeData['birth_date'] ?? null,
                'nationality_code' => $employeeData['nationality_code'] ?? null,
                'gender' => $employeeData['gender'],
                'is_married' => $employeeData['is_married'],
                'education_level' => $employeeData['education_level'] ?? null,

                // اطلاعات تماس
                'phone_number' => $employeeData['phone_number'] ?? null,
                'house_number' => $employeeData['house_number'] ?? null,
                'sos_number' => $employeeData['sos_number'] ?? null,
                'address' => $employeeData['address'] ?? null,

                // اطلاعات برنامه کاری
                'work_group_id' => $employeeData['work_group_id'] ?? null,
                'shift_schedule_id' => $employeeData['shift_schedule_id'] ?? null,
                'work_pattern_id' => $employeeData['work_pattern_id'] ?? null,

            ]);

            $user->assignRole($targetRoleName);

            return $user;
        });

        return new UserResource($user->load(['employee.organization', 'roles']));
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $this->authorize('view', $user);

        return new UserResource($user->loadMissing(['employee.organization', 'roles']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);
        $updatingUser = $request->user();
        $updatingUserEmployee = $updatingUser->employee;

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', Password::defaults()],
            'role' => ['sometimes', 'required', 'string', Rule::exists('roles', 'name')],
            'employee.status' => ['sometimes', 'required', 'string', Rule::in(['active', 'inactive'])],

            // Employee fields
            'employee.first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'employee.last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'employee.personnel_code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('employees', 'personnel_code')->ignore($user->employees?->id)], // کد پرسنلی یکتا
            'employee.organization_id' => ['sometimes', 'required', 'integer', Rule::exists('organizations', 'id')],
            'employee.position' => ['nullable', 'string', 'max:255'],
            'employee.starting_job' => ['nullable', 'date'],



            // اطلاعات شخصی
            'employee.father_name' => ['nullable', 'string', 'max:255'],
            'employee.birth_date' => ['nullable', 'date', 'before_or_equal:today'],
            'employee.nationality_code' => ['nullable', 'string', 'max:20', Rule::unique('employees', 'nationality_code')->ignore($user->employees?->id)],
            'employee.gender' => ['sometimes', 'required', 'string', Rule::in(['male', 'female'])],
            'employee.is_married' => ['sometimes', 'required', 'boolean'],
            'employee.education_level' => ['nullable', 'string', 'max:255',Rule::in(['diploma','advanced_diploma', 'bachelor', 'master','doctorate','post_doctorate']),],

            // اطلاعات تماس
            'employee.phone_number' => ['nullable', 'string', 'max:20', Rule::unique('employees', 'phone_number')->ignore($user->employees?->id)],
            'employee.house_number' => ['nullable', 'string', 'max:50'],
            'employee.sos_number' => ['nullable', 'string', 'max:20'],
            'employee.address' => ['nullable', 'string', 'max:1000'],

            // اطلاعات برنامه کاری
            'employee.work_group_id' => ['nullable', 'integer', Rule::exists('work_groups', 'id')],
            'employee.shift_schedule_id' => ['nullable', 'integer', Rule::exists('shift_schedules', 'id')],
            'employee.work_pattern_id' => ['nullable', 'integer', Rule::exists('work_patterns', 'id')],

        ]);

        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }

         $validatedData = $validator->validated();
         $employeeData = $validatedData['employee'] ?? [];
         $targetOrgId = $employeeData['organization_id'] ?? $user->employees?->organization_id;
         $targetRoleName = $validatedData['role'] ?? $user->roles->first()?->name;
         
         if (isset($employeeData['organization_id']) && $employeeData['organization_id'] !== $user->employees?->organization_id) 
         {
             if (!$this->canAdminManageOrg($updatingUser, $employeeData['organization_id'])) 
             {
                 return response()->json(['message' => 'Unauthorized scope for organization change.'], 403);
             }
         }
         // اگر نقش تغییر کرده، چک کن مجاز است؟
         if (isset($validatedData['role']) && $validatedData['role'] !== $user->roles->first()?->name)
         {
              if ($updatingUser->id === $user->id && !$updatingUser->hasRole('super-admin'))
              {
                   return response()->json(['message' => 'Users cannot change their own role.'], 403);
              }
              if (!$this->canAdminAssignRole($updatingUser, $validatedData['role'])) {
                   return response()->json(['message' => 'Unauthorized role assignment.'], 403);
              }
         }

         // 4. Update User and Employee in Transaction
         DB::transaction(function () use ($user, $validatedData, $employeeData, $targetRoleName) {
             // Update User fields
             $userDataToUpdate = [];
             if (isset($validatedData['name'])) $userDataToUpdate['name'] = $validatedData['name'];
             if (isset($validatedData['email'])) $userDataToUpdate['email'] = $validatedData['email'];
             if (!empty($validatedData['password'])) $userDataToUpdate['password'] = Hash::make($validatedData['password']);
             if (!empty($userDataToUpdate)) $user->update($userDataToUpdate);

             // Update Employee fields if provided
             if (!empty($employeeData) && $user->employees) {
                 $user->employees->update($employeeData);
             }

             // Update Role if changed and authorized
             if (isset($validatedData['role']) && $validatedData['role'] !== $user->roles->first()?->name) {
                 $user->syncRoles([$validatedData['role']]);
             }
         });

        return new UserResource($user->load(['employee.organization', 'roles']));

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // 1. Authorize: آیا کاربر اجازه حذف این کاربر را دارد؟
        $this->authorize('delete', $user);

        // 2. Prevent self-deletion
        if (request()->user()->id === $user->id) {
            return response()->json(['message' => 'Users cannot delete themselves.'], 403);
        }

        $user->delete();

        return response()->json(null, 204);
    }
    
    /**
     * Check if the admin can manage resources within the target organization.
     */
    protected function canAdminManageOrg(User $admin, int $targetOrgId): bool
    {
        if ($admin->hasRole('super-admin')) return true;

        $adminEmployee = $admin->employee;
        if (!$adminEmployee?->organization_id) return false; // Admin needs an organization

        $adminOrg = $adminEmployee->organization;
        $targetOrg = Organization::find($targetOrgId);

        if (!$targetOrg) return false; // Target organization must exist

        if ($admin->hasRole('org-admin-l2')) {
            // L2 can manage self and descendants
            return $adminOrg->isAncestorOf($targetOrg);
        }

        if ($admin->hasRole('org-admin-l3')) {
            // L3 can only manage self
            return $adminOrg->id === $targetOrg->id;
        }

        return false;
    }

    /**
     * Check if the admin can assign the target role based on hierarchy.
     */
     protected function canAdminAssignRole(User $admin, string $targetRoleName): bool
     {
         if ($admin->hasRole('super-admin')) return true;

         $allowedRoles = [];
         if ($admin->hasRole('org-admin-l2')) {
             // L2 can assign L3 or user roles
             $allowedRoles = ['org-admin-l3', 'user'];
         } elseif ($admin->hasRole('org-admin-l3')) {
             // L3 can only assign user role
             $allowedRoles = ['user'];
         }

         return in_array($targetRoleName, $allowedRoles);
     }
}
