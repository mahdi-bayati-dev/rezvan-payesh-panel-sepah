<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.User.{id}', function ($user, $id)
{
    return (int) $user->id === (int) $id;
});

Broadcast::channel('l3-channel.{organizationId}', function (User $user, $organizationId)
{
    $orgIdInt = (int) $organizationId;

    $userOrgId = $user->employee?->organization_id;

    $hasRole = $user->hasRole('org-admin-l3');


    return $hasRole && $userOrgId && ((int)$userOrgId === $orgIdInt);
});

Broadcast::channel('l2-channel.{organizationId}', function (User $user, $organizationId)
{
    $orgIdInt = (int) $organizationId;

    $userOrgId = $user->employee?->organization_id;

    $hasRole = $user->hasRole('org-admin-l2');


    return $hasRole && $userOrgId && ((int)$userOrgId === $orgIdInt);

});

Broadcast::channel('super-admin-global', function (User $user)
{
    return $user->hasRole('super_admin');
});



