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
        $work_groups = WorkGroup::with(['weekPattern', 'shiftSchedule'])
            ->orderBy('name')
            ->paginate(15);

        return new WorkGroupCollection($work_groups);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(),
            [
                'name' => 'required|string|max:255|unique:work_groups,name',
                'week_pattern_id' => 'nullable|required_without:shift_schedule_id|exists:week_patterns,id',
                'shift_schedule_id' => 'nullable|required_without:week_pattern_id|exists:shift_schedules,id',
            ]);

        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $validatedData = $validator->validated();
        if (!empty($validatedData['week_pattern_id']))
        {
             $validatedData['shift_schedule_id'] = null;
        } elseif (!empty($validatedData['shift_schedule_id']))
        {
             $validatedData['week_pattern_id'] = null;
        }
        else
        {
             return response()->json(['errors' => ['week_pattern_id' => ['Either a week pattern or a shift schedule is required.']]], 422);
        }

        $work_groups = WorkGroup::create($validatedData);

        return (new WorkGroupResource($work_groups->load(['weekPattern', 'shiftSchedule'])))
                ->response()
                ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(WorkGroup $work_group)
    {
       return new WorkGroupResource($work_group->loadMissing(['weekPattern', 'shiftSchedule']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, WorkGroup $work_group)
    {
        $validator = Validator::make($request->all(),
            [
                'name' => ['required', 'string', 'max:255', Rule::unique('work_groups')->ignore($work_group->id)],
                'week_pattern_id' => 'nullable|required_without:shift_schedule_id|exists:week_patterns,id',
                'shift_schedule_id' => 'nullable|required_without:week_pattern_id|exists:shift_schedules,id',
            ]);
        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        if (!empty($validatedData['week_pattern_id']))
        {
             $validatedData['shift_schedule_id'] = null;
        }
        elseif (!empty($validatedData['shift_schedule_id']))
        {
             $validatedData['week_pattern_id'] = null;
        }
        else
        {
             return response()->json(['errors' => ['week_pattern_id' => ['Either a week pattern or a shift schedule is required.']]], 422);
        }

        $work_group->update($validatedData);

        return new WorkGroupResource($work_group->load(['weekPattern', 'shiftSchedule']));
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
