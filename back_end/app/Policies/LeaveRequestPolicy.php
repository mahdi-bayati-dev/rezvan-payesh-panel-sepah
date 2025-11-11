<?php

namespace App\Policies;

use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Log;

class LeaveRequestPolicy
{
    use HandlesAuthorization;

    /**
     * Perform pre-authorization checks.
     *
     * @param User $user
     * @param string $ability
     * @return bool|void
     */
    public function before(User $user, string $ability)
    {
        if ($user->hasRole('super-admin')) {
            return true;
        }
    }

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
    public function view(User $user, LeaveRequest $leaveRequest): bool
    {

        // کاربر همیشه می‌تواند درخواست‌های خودش را ببیند
        if ($user->employee?->id === $leaveRequest->employee_id) {
            return true;
        }

        return $this->process($user, $leaveRequest);
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
        if (!$leaveRequest->isPending())
        {
            return false;
        }
        if ($user->employee?->id === $leaveRequest->employee_id)
        {
            return true;
        }
        return $this->process($user, $leaveRequest);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->employee?->id === $leaveRequest->employee_id && $leaveRequest->isPending();
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
    public function process(User $user, LeaveRequest $leaveRequest): bool
    {
        if (!$user->hasAnyRole(['org-admin-l2', 'org-admin-l3']))
        {
            return false;
        }
        $managerEmployee = $user->employee;

        if (!$managerEmployee || !$managerEmployee->organization) {
            Log::warning("User {$user->id} has admin role but no employee profile or organization.");
            return false;
        }

        $requestEmployee = $leaveRequest->employee;
        if (!$requestEmployee || !$requestEmployee->organization)
        {
            Log::warning("LeaveRequest {$leaveRequest->id} cannot be processed because its employee {$leaveRequest->employee_id} has no organization.");
            return false;
        }
        $managerOrgId = $managerEmployee->organization_id;
        $requestEmployeeOrg = $requestEmployee->organization;
        if ($user->hasRole('org-admin-l3'))
        {
            return $requestEmployeeOrg->id === $managerOrgId;
        }
        if ($user->hasRole('org-admin-l2'))
        {
            return $managerOrgId && $requestEmployeeOrg->ancestors()->where('id', $managerOrgId->id)->exists();
        }
        return false;
    }
}
