<?php

namespace App\Policies;

use App\Models\Employees;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class EmployeePolicy
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
    public function view(User $user, Employees $employees): bool
    {
        $userEmployeeProfile = $user->employee;
        if (!$userEmployeeProfile) return false;

        if ($user->hasRole('org-admin-l2')) {
            // ادمین L2 می‌تواند کارمندان سازمان خودش و زیرمجموعه‌ها را ببیند
            $adminOrg = $userEmployeeProfile->organization;
            $targetOrg = $employees->organization;
            // isAncestorOf شامل خود سازمان هم می‌شود اگر $targetOrg = $adminOrg باشد
            return $adminOrg && $targetOrg && $adminOrg->isAncestorOf($targetOrg);
        }

        if ($user->hasRole('org-admin-l3')) {
            // ادمین L3 فقط کارمندان سازمان خودش را می‌بیند
            return $userEmployeeProfile->organization_id === $employees->organization_id;
        }


         if ($user->hasRole('user')) {
             return $user->id === $employees->user_id;
         }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['org-admin-l2', 'org-admin-l3']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Employees $employees): bool
    {
        return $this->view($user, $employees);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Employees $employees): bool
    {
        if ($user->hasRole('user'))
        {
            return false;
        }
        return $this->view($user, $employees);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Employees $employees): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Employees $employees): bool
    {
        if ($user->hasRole('user'))
        {
            return false;
        }
        return $this->view($user, $employees);
    }
}
