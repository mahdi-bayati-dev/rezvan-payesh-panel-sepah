<?php

namespace App\Http\Controllers\Api;

use App\Enums\DailySummaryStatus;
use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\DailyAttendanceSummary;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{

    public function getStats(Request $request)
    {
        $user = $request->user();
        if($user->hasRole('user'))
        {
            return response()->json(["access denied"],403);
        }
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        $scopedEmployeeQuery = $this->getScopedEmployeeQuery($user);

        if ($scopedEmployeeQuery === null)
        {
            return response()->json(['summary_stats' => [], 'live_organization_stats' => []]);
        }


        $scopedEmployeeIds = $scopedEmployeeQuery->pluck('id');



        $todayCheckInEmployeeIds = AttendanceLog::where('event_type', AttendanceLog::TYPE_CHECK_IN)
            ->whereDate('timestamp', $today)
            ->whereIn('employee_id', $scopedEmployeeIds)
            ->distinct('employee_id')
            ->pluck('employee_id');


        $todayOnLeaveCount = LeaveRequest::where('status', LeaveRequest::STATUS_APPROVED)
            ->where('start_time', '<=', $today->endOfDay())
            ->where('end_time', '>=', $today->startOfDay())
            ->whereIn('employee_id', $scopedEmployeeIds)
            ->distinct('employee_id')
            ->count();

        $summary_stats = [
            'date' => $today->toDateString(),

            'total_lateness' => AttendanceLog::whereDate('timestamp', $today)
                ->whereIn('employee_id', $scopedEmployeeIds)
                ->where('lateness_minutes', '>', 0)
                ->distinct('employee_id')
                ->count(),

            'total_present' => $todayCheckInEmployeeIds->count(),

            'total_on_leave' => $todayOnLeaveCount,

            'total_early_departure' => AttendanceLog::whereDate('timestamp', $today)
                ->whereIn('employee_id', $scopedEmployeeIds)
                ->where('early_departure_minutes', '>', 0)
                ->distinct('employee_id')
                ->count(),


            'total_absent' => DailyAttendanceSummary::where('date', $yesterday->toDateString())
                ->whereIn('employee_id', $scopedEmployeeIds)
                ->where('status', DailySummaryStatus::ABSENT)
                ->count(),
            'absent_date_note' => $yesterday->toDateString(),
        ];

        $live_organization_stats = $this->getLiveOrganizationStats(
            $user,
            $todayCheckInEmployeeIds
        );

        return response()->json([
            'summary_stats' => $summary_stats,
            'live_organization_stats' => $live_organization_stats,
        ]);
    }

    /**

     * @param User $user
     * @return Builder|null
     */
    private function getScopedEmployeeQuery(User $user): ?Builder
    {
        if ($user->hasRole('super_admin'))
        {
            return Employee::query();
        }

        $managerEmployee = $user->employee;

        if (!$managerEmployee || !$managerEmployee->organization)
        {
            return null;
        }

        $managerOrg = $managerEmployee->organization;

        if ($user->hasRole('org-admin-l3'))
        {
            return $managerOrg->employees();
        }

        if ($user->hasRole('org-admin-l2'))
        {
            return Employee::whereHas('organization', function ($q) use ($managerOrg) {
                $q->whereIsDescendantOfOrSelf($managerOrg);
            });
        }
        return Employee::where('id', $user->employee?->id);
    }

    /**
     * [جدید] سازمان‌هایی که باید در داشبورد نمایش داده شوند را بر اساس رول برمی‌گرداند
     */
    private function getOrgsForDashboard(User $user): Collection
    {
        if ($user->hasRole('org-admin-l3')) {
            return collect();
        }

        $managerEmployee = $user->employee;

        if ($user->hasRole('org-admin-l2'))
        {
            if (!$managerEmployee || !$managerEmployee->organization)
            {
                return collect();
            }

            return Organization::where('parent_id', $managerEmployee->organization_id)
                ->with('descendants')
                ->get();
        }


        if ($user->hasRole('super_admin'))
        {
            $rootOrg = Organization::whereNull('parent_id')->first();
            if (!$rootOrg)
            {
                return collect();
            }
            return Organization::where('parent_id', $rootOrg->id)
                ->with('descendants') // Eager load
                ->get();
        }

        return collect();
    }


    private function getLiveOrganizationStats(User $user, Collection $todayCheckInEmployeeIds): array
    {
        $orgsToDisplay = $this->getOrgsForDashboard($user);

        if ($orgsToDisplay->isEmpty())
        {
            return [];
        }

        $orgBreakdown = [];

        if ($todayCheckInEmployeeIds->isEmpty())
        {
             foreach ($orgsToDisplay as $l2Org)
             {
                $orgBreakdown[] = ['name' => $l2Org->name, 'count' => 0];
             }
             return $orgBreakdown;
        }

        $presentEmployees = Employee::whereIn('id', $todayCheckInEmployeeIds)
                            ->get(['id', 'organization_id']);

        foreach ($orgsToDisplay as $org)
        {
            $orgIdsInThisBranch = $org->descendants->pluck('id')->push($org->id);

            $count = $presentEmployees->whereIn('organization_id', $orgIdsInThisBranch)->count();

            $orgBreakdown[] = [
                'name' => $org->name,
                'count' => $count
            ];
        }

        return $orgBreakdown;
    }
}
