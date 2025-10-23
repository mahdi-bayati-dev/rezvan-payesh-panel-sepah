<?php

namespace App\Providers;

use App\Models\Organization;
use App\Models\User;
use Carbon\CarbonInterval;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;
use Spatie\Permission\Models\Role;

class AuthServiceProvider extends ServiceProvider
{

    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Passport::loadKeysFrom(__DIR__.'/../../secrets/oauth');
        Passport::tokensExpireIn(CarbonInterval::days(15));
        Passport::refreshTokensExpireIn(CarbonInterval::days(30));
        Passport::personalAccessTokensExpireIn(CarbonInterval::months(6));

        Gate::before(function ($user, $ability) {
            return $user->hasRole('super-admin') ? true : null;
        });

        Gate::define('access-organization', function (User $user, Organization $organization) {
            $organizationIdsToScan = $organization->ancestors->pluck('id')->all();
            $organizationIdsToScan[] = $organization->id;

            $adminRole = Role::findByName('admin');
            if (!$adminRole)
            {
                return false;
            }
            return $user->roles()
                ->wherePivot('team_id', '!=', null)
                ->where('id', $adminRole->id)
                ->whereIn(config('permission.table_names.model_has_roles') . '.team_id', $organizationIdsToScan)
                ->exists();
        });
    }
}
