<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Jobs\ProcessEmployeeImages;
use App\Models\EmployeeImage;
use App\Models\Status;
use App\Models\Organization;
use App\Models\User;
use App\Services\CheckSystem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
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


        $query = User::with(['employee.organization', 'roles','employee.images', 'employee.workGroup', 'employee.shiftSchedule', 'employee.weekPattern']);

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

        if (!$adminOrg && ($currentUser->hasRole('org-admin-l2') || $currentUser->hasRole('org-admin-l3')))
        {
            $query->whereRaw('1 = 0');
        }

        else if ($currentUser->hasRole('org-admin-l2')) {


            $allowedOrgIds = $adminOrg->descendantsAndSelf()->pluck('id');

            $query->whereHas('employee', function ($q) use ($allowedOrgIds) {
                $q->whereIn('organization_id', $allowedOrgIds);
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
            $q->where(function ($mainQ) use ($searchTerm) {
                $mainQ->where('user_name', 'like', "%{$searchTerm}%") // فیلد user_name نداریم، username استاندارد است
                      ->orWhere('email', 'like', "%{$searchTerm}%")
                      ->orWhereHas('employee', function ($subQuery) use ($searchTerm) {
                          $subQuery->where('first_name', 'like', "%{$searchTerm}%")
                                   ->orWhere('last_name', 'like', "%{$searchTerm}%")
                                   ->orWhere('personnel_code', 'like', "%{$searchTerm}%");
                      });
            });
        });

        $query->when($request->input('role'), function ($q, $roleName) {
            $q->whereHas('roles', function ($roleQuery) use ($roleName) {
                $roleQuery->where('name', $roleName);
            });
        });

        $query->when($request->input('organization_id'), function ($q, $orgId)
        {

            $targetOrg = Organization::find($orgId);

            if ($targetOrg)
            {
                $orgIds = $targetOrg->descendantsAndSelf()->pluck('id');

                $q->whereHas('employee', function ($orgQuery) use ($orgIds)
                {
                    $orgQuery->whereIn('organization_id', $orgIds);
                });
            }
            else
            {
                $q->whereRaw('1 = 0');
            }
        });

        $perPage = (int) $request->input('per_page', 20);
        if ($perPage > 100) $perPage = 100;
        if ($perPage < 1) $perPage = 20;

        $users = $query->latest()->paginate($perPage)->withQueryString();

        return new UserCollection($users);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $installationId = $this->licenseService->getInstallationId();
        $license = Status::where('installation_id', $installationId)->first();
        $limit = $license->user_limit;
        if (!$license)
        {
             return response()->json(['message' => 'License info not found.'], 500);
        }
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

            'employee.images' => ['nullable', 'array'],
            'employee.images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],

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
        $currentUser = DB::transaction(function () use ($validatedData, $employeeData,$request) {
            $newUser = User::create([
                'user_name' => $validatedData['user_name'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'status' => $validatedData['status'],
            ]);

            $newEmployee = $newUser->employee()->create(
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

            $imagePaths = [];
            if ($request->hasFile('employee.images'))
            {
                $directory = 'users/' . $employeeData['personnel_code'];
                foreach ($request->file('employee.images') as $image) {
                    $path = $image->store($directory, 'public');
                    $imgRecord = EmployeeImage::create([
                        'employee_id' => $newEmployee->id,
                        'original_path' => $path,
                        'webp_path' => null,
                        'original_name' => $image->getClientOriginalName(),
                        'mime_type' => $image->getClientMimeType(),
                        'size' => $image->getSize(),
                    ]);
                    $imagesToProcess[] = [
                        'id' => $imgRecord->id,
                        'original_path' => $path
                    ];
                }
            }

            $newUser->assignRole($validatedData['role']);


            return [
                'user' => $newUser,
                'employee' => $newEmployee,
                'imagesToProcess' => $imagesToProcess
            ];
        });
        $currentUser = $currentUser['user'];
        $imagesToProcess = $currentUser['imagesToProcess'];

        if (!empty($imagesToProcess))
        {
            ProcessEmployeeImages::dispatch($currentUser->employee, $imagesToProcess, 'create');
        }

        return new UserResource($currentUser->load(['employee.organization', 'roles', 'employee.images','employee.workGroup']));
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $this->authorize('view', $user);

        return new UserResource($user->loadMissing(['employee.organization', 'roles', 'employee.images', 'employee.workGroup']));
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

            // اعتبارسنجی تصاویر (جدید)
            'employee.images' => ['nullable', 'array'],
            'employee.images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],

            // گزینه اختیاری برای حذف عکس‌های خاص (آرایه‌ای از IDها)
            'employee.delete_images' => ['nullable', 'array'],
            'employee.delete_images.*' => ['integer', 'exists:employee_images,id'],

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
         $updateResult = DB::transaction(function () use ($request,$user, $validatedData, $employeeData)
         {
             // Update User fields
             $userDataToUpdate = [];
             if (isset($validatedData['user_name'])) $userDataToUpdate['user_name'] = $validatedData['user_name'];
             if (isset($validatedData['email'])) $userDataToUpdate['email'] = $validatedData['email'];
             if (!empty($validatedData['password'])) $userDataToUpdate['password'] = Hash::make($validatedData['password']);
             if (!empty($userDataToUpdate)) $user->update($userDataToUpdate);

             // Update Employee fields if provided
             if (!empty($employeeData) && $user->employee)
             {
                 $employeeFields = collect($employeeData)->except(['images', 'delete_images'])->toArray();
                 $user->employee->update($employeeFields);
             }
             $aiDeletePaths = [];
             $deleteImageIds = $validatedData['employee']['delete_images'] ?? [];

             if (!empty($deleteImageIds))
             {
                 $imagesToDelete = EmployeeImage::whereIn('id', $deleteImageIds)
                     ->where('employee_id', $user->employee->id)
                     ->get();


                 foreach ($imagesToDelete as $img)
                 {
                    if ($img->original_path && Storage::disk('public')->exists($img->original_path))
                    {
                        Storage::disk('public')->delete($img->original_path);
                    }

                    if ($img->webp_path && Storage::disk('public')->exists($img->webp_path))
                    {
                        Storage::disk('public')->delete($img->webp_path);
                    }

                    if ($img->original_path)
                    {
                        $aiDeletePaths[] = $img->original_path;
                    }
                }

                 EmployeeImage::destroy($deleteImageIds);
             }
             $newImagePaths = [];
             if ($request->hasFile('employee.images'))
             {
                 $user->employee->refresh();
                 $pCode = $employeeData['personnel_code'] ?? $user->employee->personnel_code;
                 $directory = 'users/' . $pCode;
                 foreach ($request->file('employee.images') as $image)
                 {
                     $path = $image->store($directory, 'public');
                     $imgRecord = EmployeeImage::create([
                         'employee_id' => $user->employee->id,
                         'original_path' => $path,
                         'webp_path' => null,
                         'original_name' => $image->getClientOriginalName(),
                         'mime_type' => $image->getClientMimeType(),
                         'size' => $image->getSize(),
                     ]);
                     $newImagesToProcess[] = [
                         'id' => $imgRecord->id,
                         'original_path' => $path
                     ];
                 }
             }


             // Update Role if changed and authorized
             if (isset($validatedData['role']) && request()->user()->hasRole('super_admin'))
             {
                 $user->syncRoles([$validatedData['role']]);
             }
             return [
                 'aiDeletePaths' => $aiDeletePaths,
                 'newImagesToProcess' => $newImagesToProcess,
                 'personnelCode' => $user->employee->personnel_code,
                 'gender' => $user->employee->gender
             ];
         });
        $aiDeletePaths = $updateResult['aiDeletePaths'];
        $newImagesToProcess = $updateResult['newImagesToProcess'];
        $personnelCode = $updateResult['personnelCode'];
        $gender = $updateResult['gender'];

         // 1. Handle Deletions in AI
        if (!empty($aiDeletePaths))
        {
            try {
                $response = Http::delete('https://ai.eitebar.ir/v1/user', [
                    'personnel_code' => $personnelCode,
                    'gender' => $gender,
                    'images' => $aiDeletePaths,
                ]);

                if ($response->failed())
                {
                    Log::error("AI Delete Failed: " . $response->body());
                }
            }
            catch (\Exception $e)
            {
                Log::error("Failed to sync deleted images with AI: " . $e->getMessage());
            }
        }

         // 2. Handle Updates/Insertions in AI
         if (!empty($newImagesToProcess))
         {
             ProcessEmployeeImages::dispatch($user->employee, $newImagesToProcess, 'update');
         }

        return new UserResource($user->load(['employee.organization', 'roles', 'employee.images', 'employee.workGroup']));

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $employee = $user->employee;


        // 2. Prevent self-deletion
        if (request()->user()->id === $user->id)
        {
            return response()->json(['message' => 'Users cannot delete themselves.'], 403);
        }

        if ($employee)
        {
            $personnelCode = $employee->personnel_code;
            try
            {
                $response = Http::delete('https://ai.eitebar.ir/v1/user', [
                    'personnel_code' => $personnelCode,
                    'gender' => $employee->gender,
                    'images' => null,
                ]);
                if ($response->failed())
                {
                    Log::error("AI Delete Error: " . $response->body());
                }
            }
            catch (\Exception $e)
            {
                Log::error("Failed to sync deleted images with AI: " . $e->getMessage());
            }

            if ($personnelCode)
            {
                Storage::disk('public')->deleteDirectory('users/' . $personnelCode);
            }
            $employee->images()->delete();

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
