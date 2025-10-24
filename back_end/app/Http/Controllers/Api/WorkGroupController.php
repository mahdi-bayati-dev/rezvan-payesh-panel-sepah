<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkGroupCollection;
use App\Models\WorkGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WorkGroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $workGroups = WorkGroup::with(['workPattern', 'shiftSchedule'])
            ->orderBy('name')
            ->paginate(15);

        return new WorkGroupCollection($workGroups);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(),
            [
                'name' => 'required|string|max:255|unique:work_groups,name',
                'work_pattern_id' => 'nullable|required_without:shift_schedule_id|exists:work_patterns,id',
                'shift_schedule_id' => 'nullable|required_without:work_pattern_id|exists:shift_schedules,id',
            ]);

        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(WorkGroup $workGroup)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, WorkGroup $workGroup)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WorkGroup $workGroup)
    {
        //
    }
}
