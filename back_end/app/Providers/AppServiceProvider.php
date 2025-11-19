<?php

namespace App\Providers;

use App\Models\AttendanceLog;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Models\WorkGroup;
use App\Observers\AttendanceLogObserver;
use App\Observers\EmployeeObserver;
use App\Observers\LeaveRequestObserver;
use App\Observers\WorkGroupObserver;
use Illuminate\Support\Facades\Gate;
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

        Employee::observe(EmployeeObserver::class);
        WorkGroup::observe(WorkGroupObserver::class);
        AttendanceLog::observe(AttendanceLogObserver::class);
        LeaveRequest::observe(LeaveRequestObserver::class);
    }
}
