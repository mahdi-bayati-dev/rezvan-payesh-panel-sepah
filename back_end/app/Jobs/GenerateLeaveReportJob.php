<?php

namespace App\Jobs;

use App\Events\ExportReady;
use App\Exports\LeaveRequestsExport;
use App\Models\User;
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
        protected array $filters,
        protected string $filename
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try
        {

            Excel::store(
                new LeaveRequestsExport($this->user, $this->filters),
                $this->filename,
                'local_reports'
            );

            Log::info("Leave report ( {$this->filename} ) export finished.");

            $downloadUrl = URL::temporarySignedRoute(
                'reports.download',
                now()->addMinutes(120),
                ['filename' => $this->filename]
            );

            Log::info("downloading $downloadUrl");

            ExportReady::dispatch($this->user, $downloadUrl, 'گزارش مرخصی‌ها');

        }
        catch (\Exception $e)
        {
            Log::error("Failed to generate leave report for user {$this->user->id}: " . $e->getMessage());
        }
    }
}