<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\LicenseKey;
use App\Models\Organization;
use App\Models\User;
use App\Services\CheckSystem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct(protected CheckSystem $licenseService)
    {

    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $this->authorize('viewAny', User::class);

        $currentUser = $request->user();
        $currentUserEmployee = $currentUser->employee;

        $query = User::with(['employee.organization', 'roles', 'employee.workGroup', 'employee.shiftSchedule', 'employee.weekPattern']);

        if ($request->has('work_group_id'))
        {
            $groupId = $request->input('work_group_id');

            if ($groupId === 'null' || is_null($groupId))
            {
                $query->whereHas('employee', function (Builder $q)
                {
                    $q->whereNull('work_group_id');
                });
            }
            else
            {
                $query->whereHas('employee', function (Builder $q) use ($groupId) {
                    $q->where('work_group_id', $groupId);
                });
            }
        }

        $adminOrg = $currentUserEmployee?->organization;

        if(!$adminOrg && ($currentUser->hasRole('org-admin-l2') || $currentUser->hasRole('org-admin-l3')) )
        {
            $query->where(false);
        }
        else if ($currentUser->hasRole('org-admin-l2') ) {

            $query->whereHas('employee.organization', function ($q) use ($adminOrg) {
                $q->whereIsDescendantOfOrSelf($adminOrg);
            });
            $query->where('id', '!=', $currentUser->id);
        }
        elseif ($currentUser->hasRole('org-admin-l3'))
        {
            $query->whereHas('employee', function ($q) use ($adminOrg) {
                $q->where('organization_id', $adminOrg->id);
            });
            $query->where('id', '!=', $currentUser->id);
        }

        $query->when($request->input('search'), function ($q, $searchTerm)
        {
            $q->select('users.*')
              ->leftJoin('employees', 'users.id', '=', 'employees.user_id')
              ->where(function ($subQuery) use ($searchTerm) {
                  $subQuery->where('users.user_name', 'like', "%{$searchTerm}%")
                           ->orWhere('users.email', 'like', "%{$searchTerm}%")
                           ->orWhere('employees.first_name', 'like', "%{$searchTerm}%")
                           ->orWhere('employees.last_name', 'like', "%{$searchTerm}%")
                           ->orWhere('employees.personnel_code', 'like', "%{$searchTerm}%");
              });
        });

        $query->when($request->input('role'), function ($q, $roleName) {
            $q->whereHas('roles', function ($roleQuery) use ($roleName) {
                $roleQuery->where('name', $roleName);
            });
        });

        $query->when($request->input('organization_id'), function ($q, $orgId)
        {
            $organization = Organization::find($orgId);
            if ($organization)
            {
                $orgIds = $organization->descendantsAndSelf()->pluck('id');
                $q->whereHas('employee.organization', function ($orgQuery) use ($orgIds)
                {
                    $orgQuery->whereIn('id', $orgIds);
                });
            }
            else
            {
                $q->whereRaw('1 = 0');
            }
        });
        $perPage = (int) $request->input('per_page', 20);
        if ($perPage > 100)
        {
            $perPage = 100;
        }
        $users = $query->paginate($perPage)->withQueryString();

        return new UserCollection($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $installationId = $this->licenseService->getInstallationId();
        $license = LicenseKey::where('installation_id', $installationId)->first();
        $limit = $license->user_limit;
        if ($license->status === 'trial')
        {
            $limit = 99999;
        }
        if ($limit > 0)
        {
            $currentUserCount = User::count();

            if ($currentUserCount >= $limit)
            {
                return response()->json([
                    'message' => "شما به سقف مجاز تعداد کاربران ({$limit} نفر) رسیده‌اید. برای افزودن کاربر بیشتر، لایسنس خود را ارتقا دهید."
                ], 498);
            }
        }

        $creatingUser = $request->user();
        $allowedRoles = ['user'];
        $allowedOrgCheck = true;
        if ($creatingUser->hasRole('super_admin'))
        {
            $allowedRoles = Role::pluck('name')->all();
            $allowedOrgCheck = false;
        }
        $creatingUserEmployee = $creatingUser->employee;

        $validator = Validator::make($request->all(), [
            // User fields
            'user_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', 'string', Rule::in($allowedRoles)],
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

        if ($allowedOrgCheck && !$this->canAdminManageOrg($creatingUser, $targetOrgId))
        {
             return response()->json(['message' => 'Unauthorized scope for organization.'], 403);
        }
        // 4. Create User and Employee in Transaction
        $currentUser = DB::transaction(function () use ($validatedData, $employeeData) {
            $newUser = User::create([
                'user_name' => $validatedData['user_name'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'status' => $validatedData['status'],
            ]);

            $newUser->employee()->create(
                [
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

            $newUser->assignRole($validatedData['role']);

            return $newUser;
        });

        return new UserResource($currentUser->load(['employee.organization', 'roles']));
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
        $canChangeRole = $updatingUser->hasRole('super_admin') && $updatingUser->id !== $user->id;
        $allowedOrgCheck = !$updatingUser->hasRole('super_admin');
        $updatingUserEmployee = $updatingUser->employee;

        $validator = Validator::make($request->all(), [
            'user_name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', Password::defaults()],
            'role' => ['sometimes', 'required', 'string', Rule::exists('roles', 'name'),Rule::prohibitedIf(!$canChangeRole)],
            'employee.status' => ['sometimes', 'required', 'string', Rule::in(['active', 'inactive'])],

            // Employee fields
            'employee.first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'employee.last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'employee.personnel_code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('employees', 'personnel_code')->ignore($user->employee?->id)], // کد پرسنلی یکتا
            'employee.organization_id' => ['sometimes', 'required', 'integer', Rule::exists('organizations', 'id'),Rule::prohibitedIf(!$updatingUser->hasRole('super_admin'))],
            'employee.position' => ['nullable', 'string', 'max:255'],
            'employee.starting_job' => ['nullable', 'date'],



            // اطلاعات شخصی
            'employee.father_name' => ['nullable', 'string', 'max:255'],
            'employee.birth_date' => ['nullable', 'date', 'before_or_equal:today'],
            'employee.nationality_code' => ['nullable', 'string', 'max:20', Rule::unique('employees', 'nationality_code')->ignore($user->employee?->id)],
            'employee.gender' => ['sometimes', 'required', 'string', Rule::in(['male', 'female'])],
            'employee.is_married' => ['sometimes', 'required', 'boolean'],
            'employee.education_level' => ['nullable', 'string', 'max:255',Rule::in(['diploma','advanced_diploma', 'bachelor', 'master','doctorate','post_doctorate']),],

            // اطلاعات تماس
            'employee.phone_number' => ['nullable', 'string', 'max:20', Rule::unique('employees', 'phone_number')->ignore($user->employee?->id)],
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

         if ($allowedOrgCheck && isset($employeeData['organization_id']) && $employeeData['organization_id'] !== $user->employee?->organization_id)
         {
              if (!$this->canAdminManageOrg($updatingUser, $employeeData['organization_id']))
              {
                  return response()->json(['message' => 'Unauthorized scope for organization change.'], 403);
              }
         }
         // اگر نقش تغییر کرده، چک کن مجاز است؟
         if (isset($validatedData['role']) && $validatedData['role'] !== $user->roles->first()?->name)
         {
              if ($updatingUser->id === $user->id && !$updatingUser->hasRole('super_admin'))
              {
                   return response()->json(['message' => 'Users cannot change their own role.'], 403);
              }
         }

         // 4. Update User and Employee in Transaction
         DB::transaction(function () use ($user, $validatedData, $employeeData) {
             // Update User fields
             $userDataToUpdate = [];
             if (isset($validatedData['user_name'])) $userDataToUpdate['user_name'] = $validatedData['user_name'];
             if (isset($validatedData['email'])) $userDataToUpdate['email'] = $validatedData['email'];
             if (!empty($validatedData['password'])) $userDataToUpdate['password'] = Hash::make($validatedData['password']);
             if (!empty($userDataToUpdate)) $user->update($userDataToUpdate);

             // Update Employee fields if provided
             if (!empty($employeeData) && $user->employee) {
                 $user->employee->update($employeeData);
             }

             // Update Role if changed and authorized
             if (isset($validatedData['role']) && request()->user()->hasRole('super_admin'))
             {
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
        $this->authorize('delete', $user);


        // 2. Prevent self-deletion
        if (request()->user()->id === $user->id)
        {
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
        $adminEmployee = $admin->employee;
        if (!$adminEmployee?->organization_id) return false;

        $adminOrg = $adminEmployee->organization;
        $targetOrg = Organization::find($targetOrgId);

        if (!$targetOrg) return false;

        if ($admin->hasRole('org-admin-l2'))
        {

           return $adminOrg->descendantsAndSelf()->where('id', $targetOrg->id)->exists();

        }
        if ($admin->hasRole('org-admin-l3')) {
            return $adminOrg->id === $targetOrg->id;
        }
        return false;
    }
}
