<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceLogResource;
use App\Models\AttendanceLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AdminAttendanceLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', AttendanceLog::class);

        $query = AttendanceLog::with(['employee.user', 'editor']);
        if ($request->has('employee_id'))
        {
            $query->where('employee_id', $request->employee_id);
        }
        if ($request->has('date_from'))
        {
            $query->where('timestamp', '>=', $request->date_from);
        }
        if ($request->has('date_to'))
        {
            $query->where('timestamp', '<=', $request->date_to);
        }
        $logs = $query->latest('timestamp')->paginate(20);
        return AttendanceLogResource::collection($logs);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', AttendanceLog::class);
        $validator = Validator::make($request->all(),
            [
                'employee_id' => ['required', 'integer', 'exists:employees,id'],
                'event_type' => ['required', 'string', Rule::in([AttendanceLog::TYPE_CHECK_IN, AttendanceLog::TYPE_CHECK_OUT])],
                'timestamp' => ['required', 'date_format:Y-m-d H:i:s'],
                'remarks' => ['required', 'string', 'max:500'],
            ]);
        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $log = AttendanceLog::create([
            'employee_id' => $request->employee_id,
            'event_type' => $request->event_type,
            'timestamp' => $request->timestamp,
            'remarks' => $request->remarks,
            'source_name' => 'Admin Panel',
            'source_type' => AttendanceLog::SOURCE_MANUAL_ADMIN,
            'edited_by_user_id' => $request->user()->id,
        ]);
        return new AttendanceLogResource($log->load(['employee', 'editor']));
    }

    /**
     * Display the specified resource.
     */
    public function show(AttendanceLog $attendanceLog)
    {
        $this->authorize('view', $attendanceLog);
        return new AttendanceLogResource($attendanceLog->load(['employee', 'editor']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AttendanceLog $attendanceLog)
    {
        $this->authorize('update', $attendanceLog);

        $validator = Validator::make($request->all(), [
            'event_type' => ['sometimes', 'required', 'string', Rule::in([AttendanceLog::TYPE_CHECK_IN, AttendanceLog::TYPE_CHECK_OUT])],
            'timestamp' => ['sometimes', 'required', 'date_format:Y-m-d H:i:s'],
            'remarks' => ['required', 'string', 'max:500'], // دلیل ویرایش همیشه الزامی است
        ]);

        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $dataToUpdate = $validator->validated();

        $dataToUpdate['edited_by_user_id'] = $request->user()->id;
        $dataToUpdate['source_type'] = AttendanceLog::SOURCE_MANUAL_ADMIN_EDIT;

        $attendanceLog->update($dataToUpdate);

        return new AttendanceLogResource($attendanceLog->load(['employee', 'editor']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AttendanceLog $attendanceLog)
    {
        $this->authorize('delete', $attendanceLog);
        $attendanceLog->update([
             'edited_by_user_id' => Auth::id(),
            'is_allowed' => true
         ]);
        return new AttendanceLogResource($attendanceLog->load(['employee', 'editor']));
    }
}
