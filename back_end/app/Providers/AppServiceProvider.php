<?php

namespace App\Providers;

use App\Models\Employees;
use App\Models\WorkGroup;
use App\Observers\EmployeeObserver;
use App\Observers\WorkGroupObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Employees::observe(EmployeeObserver::class);
        WorkGroup::observe(WorkGroupObserver::class);
    }
}
