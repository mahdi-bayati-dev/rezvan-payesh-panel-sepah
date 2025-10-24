<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkPatternCollection;
use App\Http\Resources\WorkPatternResource;
use App\Models\WorkPattern;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class WorkPatternController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $workPatterns = WorkPattern::query()
            ->when($request->query('type'), function ($query, $type) {
                $query->where('type', $type);
            })
            ->orderBy('name')
            ->paginate(15);
        return new WorkPatternCollection($workPatterns);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(),
            [
                'name' => 'required|string|max:255|unique:work_patterns,name',
                'type' => ['required', Rule::in(['fixed', 'floating'])],
                'start_time' => 'required_if:type,fixed|nullable|date_format:H:i',
                'end_time' => 'required_if:type,fixed|nullable|date_format:H:i',
                'work_duration_minutes' => 'required|integer|min:1|max:1440',
            ]);
        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        if ($validatedData['type'] === 'fixed' && $validatedData['start_time'] === $validatedData['end_time'])
        {
             return response()->json(['errors' => ['end_time' => ['End time cannot be the same as start time for fixed shifts.']]], 422);
        }

        if ($validatedData['type'] === 'floating')
        {
            $validatedData['start_time'] = null;
            $validatedData['end_time'] = null;
        }

        $workPattern = WorkPattern::create($validatedData);

        return (new WorkPatternResource($workPattern))
                ->response()
                ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(WorkPattern $workPattern, Request $request)
    {
        return response()->json($workPattern);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, WorkPattern $workPattern)
    {
         $validator = Validator::make($request->all(),
            [

                'name' => ['required', 'string', 'max:255', Rule::unique('work_patterns')->ignore($workPattern->id)],
                'type' => ['required', Rule::in(['fixed', 'floating'])],
                'start_time' => 'required_if:type,fixed|nullable|date_format:H:i',
                'end_time' => 'required_if:type,fixed|nullable|date_format:H:i',
                'work_duration_minutes' => 'required|integer|min:1|max:1440',
            ]);

        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $validatedData = $validator->validated();

        if ($validatedData['type'] === 'fixed' && $validatedData['start_time'] === $validatedData['end_time'])
        {
             return response()->json(['errors' => ['end_time' => ['End time cannot be the same as start time for fixed shifts.']]], 422);
        }
        if ($validatedData['type'] === 'floating')
        {
            $validatedData['start_time'] = null;
            $validatedData['end_time'] = null;
        }

        $workPattern->update($validatedData);

        return new WorkPatternResource($workPattern);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WorkPattern $workPattern, Request $request)
    {
        if ($workPattern->workGroups()->exists())
        {
            return response()->json(['message' => 'Cannot delete work pattern because it is assigned to one or more work groups.'], 409);
        }

        $workPattern->delete();

        return response()->json(null, 204);

    }
}
