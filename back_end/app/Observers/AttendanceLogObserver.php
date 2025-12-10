<?php

namespace App\Observers;

use App\Events\AttendanceLogCreated;
use App\Models\AttendanceLog;

class AttendanceLogObserver
{
    /**
     * Handle the AttendanceLog "created" event.
     */
    public function created(AttendanceLog $attendanceLog): void
    {
//        $attendanceLog->load('employee');
        AttendanceLogCreated::dispatch($attendanceLog);
    }

    /**
     * Handle the AttendanceLog "updated" event.
     */
    public function updated(AttendanceLog $attendanceLog): void
    {
        //
    }

    /**
     * Handle the AttendanceLog "deleted" event.
     */
    public function deleted(AttendanceLog $attendanceLog): void
    {
        //
    }

    /**
     * Handle the AttendanceLog "restored" event.
     */
    public function restored(AttendanceLog $attendanceLog): void
    {
        //
    }

    /**
     * Handle the AttendanceLog "force deleted" event.
     */
    public function forceDeleted(AttendanceLog $attendanceLog): void
    {
        //
    }
}
