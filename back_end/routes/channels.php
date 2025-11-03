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

Broadcast::channel('super-admin-global', function (User $user)
{
    \Log::info('[BROADCAST AUTH] User authenticated with ID: ' . $user->id);

    if ($user->hasRole('super_admin'))
    {
        return ['id' => $user->id, 'name' => $user->name, 'role' => 'super_admin'];
    }

    return false;
});



