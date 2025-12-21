<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.User.{id}', function ($user, $id)
{
    \Log::info("Broadcast Auth Check: User {$user->id} trying to access {$id}");
    return (int) $user->id === (int) $id;
});

Broadcast::channel('l3-channel.{organizationId}', function (User $user, $organizationId)
{
    return $user->hasRole('org-admin-l3') &&
           (int) $user->employee?->organization_id === $organizationId;
});

Broadcast::channel('l2-channel.{organizationId}', function (User $user, $organizationId)
{
    $orgIdInt = (int) $organizationId;

    $userOrgId = $user->employee?->organization_id;

    $hasRole = $user->hasRole('org-admin-l2');

    \Log::info("Broadcast Auth L2:", [
        'user_id' => $user->id,
        'has_role' => $hasRole ? 'YES' : 'NO',
        'user_org_from_employee' => $userOrgId,
        'requested_org' => $orgIdInt,
    ]);

    return $hasRole && $userOrgId && ((int)$userOrgId === $orgIdInt);

});

Broadcast::channel('super-admin-global', function (User $user)
{
    return $user->hasRole('super_admin');
});



