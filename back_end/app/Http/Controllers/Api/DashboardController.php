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
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    /**
     * متد واسط برای هدایت کاربر به داشبورد مناسب (Admin vs User)
     * GET /api/dashboard/stats
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // اگر کاربر نقش ادمین دارد
        if ($user->hasRole(['super_admin', 'org-admin-l2', 'org-admin-l3'])) {
            return $this->getAdminDashboardStats($request);
        }

        // اگر کاربر یک کارمند عادی است
        return $this->getUserDashboardStats($request);
    }

    /**
     * دریافت آمار داشبورد برای کاربر لاگین شده در ماه جاری (User-Level)
     */
    public function getUserDashboardStats(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (!$user->employee) {
            return response()->json([
                'message' => 'رکورد کارمند برای این کاربر یافت نشد.'
            ], 404);
        }

        $employeeId = $user->employee->id;

        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $today = Carbon::today()->toDateString();

        // ۳. آمار غیبت‌ها و تعجیل‌ها (از جدول DailyAttendanceSummary)
        $monthlySummary = DailyAttendanceSummary::where('employee_id', $employeeId)
            ->whereBetween('date', [$startOfMonth, $today])
            ->get();

        // ۴. محاسبه آمار
        $absencesCount = $monthlySummary->where('status', DailySummaryStatus::ABSENT->value)->count();
        $earlyExitsCount = $monthlySummary->where('status', DailySummaryStatus::PRESENT_WITH_LEAVE->value)->count();

        // ۳. مرخصی‌های تأیید شده
        $leavesApprovedCount = LeaveRequest::where('employee_id', $employeeId)
            ->where('status', LeaveRequest::STATUS_APPROVED)
            ->where(function ($query) use ($startOfMonth, $today) {
                $query->whereBetween('start_time', [$startOfMonth, $today])
                      ->orWhereBetween('end_time', [$startOfMonth, $today])
                      ->orWhere(function ($q) use ($startOfMonth, $today) {
                          $q->where('start_time', '<', $startOfMonth)
                            ->where('end_time', '>', $today);
                      });
            })
            ->count();

        $stats = [
            'absences_count' => $absencesCount,
            'leaves_approved_count' => $leavesApprovedCount,
            'early_exits_count' => $earlyExitsCount,
        ];

        return response()->json($stats);
    }

    /**
     * متد داشبورد ادمین (Admin-Level Dashboard Logic)
     */
    public function getAdminDashboardStats(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole(['super_admin', 'org-admin-l2', 'org-admin-l3'])) {
            return response()->json(["message" => "Access denied"], 403);
        }

        $today = Carbon::today();

        $scopedEmployeeQuery = $this->getScopedEmployeeQuery($user);

        if ($scopedEmployeeQuery === null)
        {
            return response()->json(['summary_stats' => [], 'live_organization_stats' => []]);
        }

        $scopedEmployeeIds = $scopedEmployeeQuery->pluck('id');
        $totalScopedEmployees = $scopedEmployeeIds->count();


        $todayCheckInEmployeeIds = AttendanceLog::where('event_type', AttendanceLog::TYPE_CHECK_IN)
            ->whereDate('timestamp', $today)
            ->whereIn('employee_id', $scopedEmployeeIds)
            ->distinct('employee_id')
            ->pluck('employee_id');

        $todayOnLeaveEmployeeIds = LeaveRequest::where('status', LeaveRequest::STATUS_APPROVED)
            ->where('start_time', '<=', $today->endOfDay())
            ->where('end_time', '>=', $today->startOfDay())
            ->whereIn('employee_id', $scopedEmployeeIds)
            ->distinct('employee_id')
            ->pluck('employee_id');

        $totalLateness = AttendanceLog::whereDate('timestamp', $today)
            ->whereIn('employee_id', $todayCheckInEmployeeIds)
            ->where('lateness_minutes', '>', 0)
            ->distinct('employee_id')
            ->count();

        $totalEarlyDeparture = AttendanceLog::whereDate('timestamp', $today)
            ->whereIn('employee_id', $todayCheckInEmployeeIds)
            ->where('early_departure_minutes', '>', 0)
            ->distinct('employee_id')
            ->count();

        $presentOrOnLeaveIds = $todayCheckInEmployeeIds->union($todayOnLeaveEmployeeIds)->unique();
        $totalAbsent = $totalScopedEmployees - $presentOrOnLeaveIds->count();

        $summary_stats = [
            'date' => $today->toDateString(),
            'total_lateness' => $totalLateness,
            'total_present' => $todayCheckInEmployeeIds->count(),
            'total_on_leave' => $todayOnLeaveEmployeeIds->count(),
            'total_early_departure' => $totalEarlyDeparture,
            'total_absent' => max(0, $totalAbsent),
            'total_employees_scoped' => $totalScopedEmployees,
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

    private function getScopedEmployeeQuery(User $user): ?Builder
    {
        if ($user->hasRole('super_admin')) {
            return Employee::query();
        }

        $managerEmployee = $user->employee;

        if (!$managerEmployee || !$managerEmployee->organization) {
            return null;
        }

        $managerOrg = $managerEmployee->organization;

        // مدیر سطح ۳ فقط کارمندان مستقیم سازمان خودش را می‌بیند
        if ($user->hasRole('org-admin-l3')) {
            return Employee::where('organization_id', $managerOrg->id);
        }

        if ($user->hasRole('org-admin-l2')) {

            $subOrgIds = $managerOrg->descendantsAndSelf()->pluck('id');

            return Employee::whereIn('organization_id', $subOrgIds);
        }

        return Employee::where('id', $user->employee?->id);
    }


    private function getOrgsForDashboard(User $user): Collection
    {
        if ($user->hasRole('org-admin-l3'))
        {
            return collect();
        }

        if ($user->hasRole('org-admin-l2'))
        {
            $managerEmployee = $user->employee;
            if (!$managerEmployee || !$managerEmployee->organization)
            {
                return collect();
            }
            $managerEmployee->organization->load('children');
            // بارگذاری فرزندان برای نمایش در نمودار زنده
            return collect([$managerEmployee->organization]);
        }

        if ($user->hasRole('super_admin'))
        {
            return Organization::whereNull('parent_id')
                ->with('children')
                ->get();
        }

        return collect();
    }


    private function getLiveOrganizationStats(User $user, Collection $todayCheckInEmployeeIds): array
    {
        $parentOrgsToDisplay = $this->getOrgsForDashboard($user);

        if ($parentOrgsToDisplay->isEmpty()) {
            return [];
        }

        $orgBreakdown = [];

        // اگر هیچکس حاضر نیست، آمار صفر برگردان
        if ($todayCheckInEmployeeIds->isEmpty())
        {
             foreach ($parentOrgsToDisplay as $parentOrg)
             {
                $childStats = [];
                foreach ($parentOrg->children as $childOrg)
                {
                     $childStats[] = [
                         'org_id' => $childOrg->id,
                         'org_name' => $childOrg->name,
                         'count' => 0
                     ];
                }
                 $orgBreakdown[] = [
                    'parent_org_id' => $parentOrg->id,
                    'parent_org_name' => $parentOrg->name,
                    'children_stats' => $childStats
                 ];
             }
             return $orgBreakdown;
        }

        // گرفتن کارمندان حاضر به همراه ID سازمانشان
        $presentEmployees = Employee::whereIn('id', $todayCheckInEmployeeIds)
                            ->get(['id', 'organization_id']);

        foreach ($parentOrgsToDisplay as $parentOrg) {
            $childStats = [];

            foreach($parentOrg->children as $childOrg) {
                $orgIdsInThisBranch = $childOrg->descendants()->pluck('id')->push($childOrg->id);

                $count = $presentEmployees->whereIn('organization_id', $orgIdsInThisBranch)->count();

                $childStats[] = [
                    'org_id' => $childOrg->id,
                    'org_name' => $childOrg->name,
                    'count' => $count
                ];
            }

            $orgBreakdown[] = [
                'parent_org_id' => $parentOrg->id,
                'parent_org_name' => $parentOrg->name,
                'children_stats' => $childStats
            ];
        }

        return $orgBreakdown;
    }
}