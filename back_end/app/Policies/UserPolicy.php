<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class UserPolicy
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
    public function view(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return true;
        }

        $userEmployeeProfile = $user->employee; // پروفایل کارمندی کاربر لاگین کرده
        $modelEmployeeProfile = $model->employee; // پروفایل کارمندی کاربر هدف

        // اگر یکی از کاربران پروفایل کارمندی یا سازمان نداشته باشد، دسترسی محدود می‌شود
        if (!$userEmployeeProfile?->organization_id || !$modelEmployeeProfile?->organization_id) {
             // فقط اجازه دیدن خود کاربر را می‌دهیم که در بالا هندل شد
            return false;
        }

        $adminOrg = $userEmployeeProfile->organization;
        $targetOrg = $modelEmployeeProfile->organization;

        if ($user->hasRole('org-admin-l2')) {
            // ادمین L2 می‌تواند کاربران سازمان خودش و زیرمجموعه‌ها را ببیند
            return $adminOrg && $targetOrg && $adminOrg->isAncestorOf($targetOrg);
        }

        if ($user->hasRole('org-admin-l3')) {
            // ادمین L3 فقط کاربران سازمان خودش را می‌بیند
            return $userEmployeeProfile->organization_id === $modelEmployeeProfile->organization_id;
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
    public function update(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return true;
        }

        // بررسی دسترسی سلسله مراتبی برای ویرایش دیگران
        return $this->view($user, $model);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }
        // کاربر عادی نمی‌تواند کسی را حذف کند
        if ($user->hasRole('user'))
        {
            return false;
        }
        // ادمین‌ها فقط می‌توانند کاربرانی را حذف کنند که اجازه دیدنشان را دارند
        return $this->view($user, $model);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        return false;
    }
}
