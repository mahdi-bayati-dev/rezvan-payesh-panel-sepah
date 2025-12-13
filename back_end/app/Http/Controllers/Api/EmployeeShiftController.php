<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmployeeShift;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeShiftController extends Controller
{
    /**
     * نمایش لیست شیفت‌های تخصیص داده شده با قابلیت فیلتر
     */
        public function index(Request $request, $scheduleId = null)
    {

        $query = EmployeeShift::with(['employee.user', 'workPattern', 'shiftSchedule']);


        if ($scheduleId)
        {
            $query->where('shift_schedule_id', $scheduleId);
        }

        elseif ($request->has('shift_schedule_id'))
        {
            $query->where('shift_schedule_id', $request->shift_schedule_id);
        }

        // فیلتر تاریخ
        if ($request->has('start_date'))
        {
            $query->where('date', '>=', $request->start_date);
        }
        if ($request->has('end_date'))
        {
            $query->where('date', '<=', $request->end_date);
        }

        if ($request->has('employee_id'))
        {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('is_off_day'))
        {
            $query->where('is_off_day', filter_var($request->is_off_day, FILTER_VALIDATE_BOOLEAN));
        }

        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy('date', $sortOrder);

        $perPage = (int) $request->input('per_page', 20);

        $shifts = $query->paginate($perPage);

        return JsonResource::collection($shifts);
    }
}