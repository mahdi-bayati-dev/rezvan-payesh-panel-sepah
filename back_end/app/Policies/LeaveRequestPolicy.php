<?php

namespace App\Policies;

use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class LeaveRequestPolicy
{
    use HandlesAuthorization;
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['org-admin-l2', 'org-admin-l3', 'user']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, LeaveRequest $leaveRequest): bool
    {
        $userEmployeeProfile = $user->employee;
        if (!$userEmployeeProfile?->organization_id) return false;

        // کاربر همیشه می‌تواند درخواست‌های خودش را ببیند
        if ($userEmployeeProfile->id === $leaveRequest->employee_id) {
            return true;
        }

        // بررسی دسترسی مدیران
        $targetEmployee = $leaveRequest->employee; // رابطه employee در LeaveRequest لازم است
        if (!$targetEmployee?->organization_id) return false; // اگر کارمند درخواست دهنده سازمان ندارد

        $adminOrg = $userEmployeeProfile->organization;
        $targetOrg = $targetEmployee->organization;

        if ($user->hasRole('org-admin-l2')) {
            // ادمین L2 می‌تواند درخواست‌های کارمندان سازمان خودش و زیرمجموعه‌ها را ببیند
            return $adminOrg && $targetOrg && $adminOrg->isAncestorOf($targetOrg);
        }

        if ($user->hasRole('org-admin-l3')) {
            // ادمین L3 فقط درخواست‌های کارمندان سازمان خودش را می‌بیند
            return $userEmployeeProfile->organization_id === $targetEmployee->organization_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->employee()->exists();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, LeaveRequest $leaveRequest): bool
    {
        $userEmployeeProfile = $user->employee;
        if ($userEmployeeProfile && $userEmployeeProfile->id === $leaveRequest->employee_id && $leaveRequest->status === 'pending')
        {
            return true;
        }
        if ($user->hasAnyRole(['org-admin-l2', 'org-admin-l3']))
        {
            return $this->view($user, $leaveRequest);
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, LeaveRequest $leaveRequest): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, LeaveRequest $leaveRequest): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, LeaveRequest $leaveRequest): bool
    {
        return false;
    }
}
