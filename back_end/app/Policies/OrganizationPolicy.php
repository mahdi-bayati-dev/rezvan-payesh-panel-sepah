<?php

namespace App\Policies;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class OrganizationPolicy
{
    use HandlesAuthorization;
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['org-admin-l2', 'org-admin-l3']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Organization $organization): bool
    {
        $userEmployeeProfile = $user->employee;
        if (!$userEmployeeProfile?->organization_id) return false;

        $adminOrg = $userEmployeeProfile->organization;

        if ($user->hasRole('org-admin-l2')) {
            // ادمین L2 می‌تواند سازمان خودش و تمام زیرمجموعه‌هایش را ببیند

            return $adminOrg->descendantsAndSelf()->where('id', $organization->id)->exists();
        }

        if ($user->hasRole('org-admin-l3')) {
            // ادمین L3 فقط سازمان خودش را می‌بیند
            return $userEmployeeProfile->organization_id === $organization->id;
        }
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Organization $organization): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Organization $organization): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Organization $organization): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Organization $organization): bool
    {
        return false;
    }
}
