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
           (int) $user->organization_id === $organizationId;
});

Broadcast::channel('l2-channel.{organizationId}', function (User $user, $organizationId)
{
    $orgIdInt = (int) $organizationId;
    $userOrgId = (int) $user->organization_id;

    $hasRole = method_exists($user, 'hasRole') ? $user->hasRole('org-admin-l2') : false;
    \Log::info("Broadcast Debug L2:", [
        'user_id' => $user->id ?? 'null',
        'has_role' => $hasRole ? 'YES' : 'NO',
        'user_org' => $userOrgId,
        'req_org' => $orgIdInt,
        'match' => ($userOrgId === $orgIdInt) ? 'YES' : 'NO'
    ]);
    return $hasRole && ($userOrgId === $orgIdInt);
});

Broadcast::channel('super-admin-global', function (User $user)
{
    return $user->hasRole('super_admin');
});



