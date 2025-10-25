<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkGroupCollection;
use App\Http\Resources\WorkGroupResource;
use App\Models\WorkGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class WorkGroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', WorkGroup::class);
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
        $validatedData = $validator->validated();

        $workGroup = WorkGroup::create($validatedData);

        return new WorkGroupResource($workGroup->load(['workPattern', 'shiftSchedule']));
    }

    /**
     * Display the specified resource.
     */
    public function show(WorkGroup $workGroup)
    {
       return new WorkGroupResource($workGroup->loadMissing(['workPattern', 'shiftSchedule']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, WorkGroup $workGroup)
    {
        $validator = Validator::make($request->all(),
            [
                'name' => ['required', 'string', 'max:255', Rule::unique('work_groups')->ignore($workGroup->id)],
                'work_pattern_id' => 'nullable|required_without:shift_schedule_id|exists:work_patterns,id',
                'shift_schedule_id' => 'nullable|required_without:work_pattern_id|exists:shift_schedules,id',
            ]);
        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        // اطمینان از اینکه فقط یکی از الگو یا برنامه مقدار دارد
        if (!empty($validatedData['work_pattern_id']))
        {
             $validatedData['shift_schedule_id'] = null;
        }
        elseif (!empty($validatedData['shift_schedule_id']))
        {
             $validatedData['work_pattern_id'] = null;
        }

        $workGroup->update($validatedData);

        return new WorkGroupResource($workGroup->load(['workPattern', 'shiftSchedule']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WorkGroup $workGroup)
    {
        if ($workGroup->employee()->exists())
        {
            return response()->json(['message' => 'Cannot delete work group because it has associated employees.'], 409); // Conflict
        }
        $workGroup->delete();

        return response()->json(null, 204);
    }
}
