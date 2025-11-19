<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceLogCollection;
use App\Http\Resources\AttendanceLogResource;
use App\Models\AttendanceLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class MyAttendanceLogController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $employee = $user->employee;

        if (!$employee)
        {
            return response()->json(['message' => 'Employee profile not found.'], 404);
        }

        $allowedSortColumns = [
            'timestamp',
            'type',
            'is_manual',
            'lateness_minutes'
        ];

        $validator = Validator::make($request->all(), [
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',

            'type'         => ['nullable', 'string', Rule::in([AttendanceLog::TYPE_CHECK_IN, AttendanceLog::TYPE_CHECK_OUT])],
            'is_manual'    => 'nullable|boolean',
            'has_lateness' => 'nullable|boolean',
            'search'       => 'nullable|string|max:100',

            'sort_by'    => ['nullable', 'string', Rule::in($allowedSortColumns)],
            'sort_dir'   => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        $query = $employee->attendanceLogs();

        $query->when(isset($validated['start_date']), function ($q) use ($validated)
        {
            $q->whereDate('timestamp', '>=', $validated['start_date']);
        });

        $query->when(isset($validated['end_date']), function ($q) use ($validated)
        {
            $q->whereDate('timestamp', '<=', $validated['end_date']);
        });

        $query->when(isset($validated['type']), function ($q) use ($validated)
        {
            $q->where('event_type', $validated['type']);
        });

        $query->when(isset($validated['is_manual']), function ($q) use ($validated)
        {
            if ($validated['is_manual'])
            {
                $q->where('source_type', '!=', AttendanceLog::SOURCE_DEVICE);
            }
            else
            {
                $q->where('source_type', '=', AttendanceLog::SOURCE_DEVICE);
            }
        });

        $query->when(isset($validated['has_lateness']) && $validated['has_lateness'], function ($q)
        {
            $q->where('lateness_minutes', '>', 0);
        });

        $query->when(isset($validated['search']), function ($q) use ($validated)
        {
            $q->where('remarks', 'like', '%' . $validated['search'] . '%');
        });


        $sortByParam = $validated['sort_by'] ?? 'timestamp';
        $sortDir = $validated['sort_dir'] ?? 'desc';
        $columnMap = [
            'timestamp'        => 'timestamp',
            'lateness_minutes' => 'lateness_minutes',
            'type'             => 'event_type',
            'is_manual'        => 'source_type',
        ];
        $sortByColumn = $columnMap[$sortByParam] ?? 'timestamp';

        $query->orderBy($sortByColumn, $sortDir);

        $perPage = (int) $request->input('per_page', 20);
        if ($perPage > 100)
        {
            $perPage = 100;
        }
        $logs = $query->paginate($perPage)
                      ->withQueryString();

        return new AttendanceLogCollection($logs);
    }

    /**
     * نمایش جزئیات یک لاگ حضور و غیاب خاص
     */
    public function show(Request $request, AttendanceLog $attendanceLog)
    {
        $this->authorize('view', $attendanceLog);

        return new AttendanceLogResource($attendanceLog->loadMissing('employee'));
    }
}
