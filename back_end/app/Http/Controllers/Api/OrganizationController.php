<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrganizationController extends Controller
{
    /**
     * اعمال پالیسی برای تمام متدهای
     */
    public function __construct()
    {
        $this->authorizeResource(Organization::class, 'organization');
    }

    /**
     * نمایش لیست سازمان‌ها بر اساس دسترسی کاربر.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->hasRole('super_admin')) {

            $allOrgs = Organization::tree()->get();
            $organizations = $allOrgs->toTree();
            return OrganizationResource::collection($organizations);
        }

        if (!$user->employee || !$user->employee->organization) {
            return response()->json(['message' => 'Admin has no organization assigned.'], 403);
        }

        $adminOrg = $user->employee->organization;

        if ($user->hasRole('org-admin-l2')) {

            return new OrganizationResource($adminOrg->load('descendants'));
        }

        if ($user->hasRole('org-admin-l3')) {

            return new OrganizationResource($adminOrg);
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }

    /**
     * ذخیره سازمان جدید. (فقط سوپر ادمین)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:organizations,id'],
        ]);

        $organization = Organization::create($validated);

        return response()->json(new OrganizationResource($organization), 201);
    }

    /**
     * نمایش یک سازمان خاص.
     */
    public function show(Organization $organization)
    {
        return new OrganizationResource(
            $organization->load(['children', 'employees']) // فرزندان مستقیم و کارمندان
                         ->loadCount('employees') // تعداد کارمندان
        );
    }

    /**
     * به‌روزرسانی سازمان. (فقط سوپر ادمین)
     */
    public function update(Request $request, Organization $organization)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'parent_id' => [
                'sometimes', 'nullable', 'integer', 'exists:organizations,id',
                Rule::notIn([$organization->id]), // نمی‌تواند والد خودش باشد
            ],
        ]);

        $organization->update($validated);

        return new OrganizationResource($organization);
    }

    /**
     * حذف سازمان. (فقط سوپر ادمین)
     */
    public function destroy(Organization $organization)
    {
        if ($organization->children()->exists()) {
            return response()->json(['message' => 'Cannot delete organization: It has child organizations.'], 422);
        }


        if ($organization->employees()->exists()) {
            return response()->json(['message' => 'Cannot delete organization: It has assigned employees.'], 422);
        }

        $organization->delete();

        return response()->json(null, 204);
    }
}