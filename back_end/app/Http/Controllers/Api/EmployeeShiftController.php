<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmployeeShift;
use App\Models\ShiftSchedule;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeShiftController extends Controller
{
    /**
     * نمایش لیست شیفت‌های تخصیص داده شده با قابلیت فیلتر
     */
    public function index(Request $request, $id )
    {
        $query = EmployeeShift::where("shift_schedule_id",$id)->with(['employee', 'workPattern', 'shiftSchedule']);

        if ($request->has('start_date'))
        {
            $query->where('date', '>=', $request->start_date);
        }
        if ($request->has('end_date'))
        {
            $query->where('date', '<=', $request->end_date);
        }

        if ($request->has('shift_schedule_id'))
        {
            $query->where('shift_schedule_id', $request->shift_schedule_id);
        }

        if ($request->has('employee_id'))
        {
            $query->where('employee_id', $request->employee_id);
        }

        $query->orderBy('date', 'desc');

        $perPage = (int) $request->input('per_page', 20);
        $shifts = $query->paginate($perPage);

        return JsonResource::collection($shifts);
    }
}