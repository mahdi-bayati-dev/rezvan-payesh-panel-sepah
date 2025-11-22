<?php

namespace App\Jobs;

use App\Exports\LeaveRequestsExport;
use App\Events\ExportReady; // ایونت جدید
use App\Models\LeaveRequest;
use App\Models\User;
use App\Models\Organization;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Maatwebsite\Excel\Facades\Excel;

class GenerateLeaveReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected User $user,
        protected array $filters
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try
        {
            $query = LeaveRequest::with(['employee.organization', 'leaveType', 'processor']);
            $currentUserEmployee = $this->user->employee;
            $adminOrg = $currentUserEmployee?->organization;


            if (!$adminOrg && ($this->user->hasRole('org-admin-l2') || $this->user->hasRole('org-admin-l3')))
            {
                $query->whereRaw('1 = 0');
            } elseif ($this->user->hasRole('org-admin-l2'))
            {
                $allowedOrgIds = $adminOrg->descendantsAndSelf()->pluck('id');
                $query->whereHas('employee', function ($q) use ($allowedOrgIds)
                {
                    $q->whereIn('organization_id', $allowedOrgIds);
                });
            }
            elseif ($this->user->hasRole('org-admin-l3'))
            {
                $query->whereHas('employee', function ($q) use ($adminOrg)
                {
                    $q->where('organization_id', $adminOrg->id);
                });
            }


            if (isset($this->filters['organization_id']))
            {
                $targetOrg = Organization::find($this->filters['organization_id']);
                if ($targetOrg)
                {
                    $orgIds = $targetOrg->descendantsAndSelf()->pluck('id');
                    $query->whereHas('employee', fn($q) => $q->whereIn('organization_id', $orgIds));
                }
            }

            if (isset($this->filters['search'])) {
                $searchTerm = $this->filters['search'];
                $query->whereHas('employee', function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', "%{$searchTerm}%")
                      ->orWhere('last_name', 'like', "%{$searchTerm}%")
                      ->orWhere('personnel_code', 'like', "%{$searchTerm}%");
                });
            }
            if (isset($this->filters['from_date'])) $query->whereDate('start_time', '>=', $this->filters['from_date']);
            if (isset($this->filters['to_date'])) $query->whereDate('end_time', '<=', $this->filters['to_date']);
            if (isset($this->filters['status'])) $query->where('status', $this->filters['status']);
            if (isset($this->filters['leave_type_id'])) $query->where('leave_type_id', $this->filters['leave_type_id']);

            $query->latest();


            $filename = 'reports/leave-requests-' . now()->format('YmdHis') . '-' . $this->user->id . '.xlsx';


            Excel::store(new LeaveRequestsExport($query), $filename, 'local_reports');

            Log::info("Leave report generated: $filename");


            $downloadUrl = URL::temporarySignedRoute(
                'reports.download',
                now()->addMinutes(120),
                ['filename' => $filename]
            );

            ExportReady::dispatch($this->user, $downloadUrl, 'گزارش مرخصی‌ها');

        }
        catch (\Exception $e)
        {
            Log::error("Failed to generate leave report for user {$this->user->id}: " . $e->getMessage());
        }
    }
}