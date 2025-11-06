<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.User.{id}', function ($user, $id)
{
    return (int) $user->id === (int) $id;
});

Broadcast::channel('l3-channel.{organizationId}', function (User $user, int $organizationId)
{
    return $user->hasRole('org-admin-l3') &&
           (int) $user->organization_id === $organizationId;
});

Broadcast::channel('l2-channel.{organizationId}', function (User $user, int $organizationId)
{
    return $user->hasRole('org-admin-l2') &&
           (int) $user->organization_id === $organizationId;
});

Broadcast::channel('super-admin-global', function (User $user) {

    // [عیب‌یابی] نقش‌های این کاربر را در لاگ ثبت کن
    $roles = $user->getRoleNames(); // <-- گرفتن لیست نقش‌ها
    Log::info('[BROADCAST AUTH] User ID: ' . $user->id . ' | Roles: ' . json_encode($roles));

    // چک کردن دستی به جای hasRole
    if ($roles->contains('super_admin')) {
        return true;
    }

    return false;
});

