<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShiftScheduleCollection;
use App\Http\Resources\ShiftScheduleResource;
use App\Models\ScheduleSlot;
use App\Models\ShiftSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ShiftScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $schedules = ShiftSchedule::orderBy('name')->paginate(15);
        return new ShiftScheduleCollection($schedules);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:shift_schedules,name',
            'cycle_length_days' => 'required|integer|min:1|max:31', // چرخه بین ۱ تا ۳۱ روز
            'cycle_start_date' => 'required|date_format:Y-m-d',

            'slots' => 'sometimes|array',
            'slots.*.day_in_cycle' => 'required_with:slots|integer|distinct', // هر روز باید یکتا باشد
            'slots.*.work_pattern_id' => 'nullable|exists:work_patterns,id',
        ]);
        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        $schedule = DB::transaction(function () use ($validatedData)
        {
            $schedule = ShiftSchedule::create(
                [
                    'name' => $validatedData['name'],
                    'cycle_length_days' => $validatedData['cycle_length_days'],
                    'cycle_start_date' => $validatedData['cycle_start_date'],
                ]);
            for ($day = 1; $day <= $schedule->cycle_length_days; $day++) {
                ScheduleSlot::create(
                    [
                        'shift_schedule_id' => $schedule->id,
                        'day_in_cycle' => $day,
                        'work_pattern_id' => null, // پیش‌فرض روز استراحت
                    ]);
                if (isset($validatedData['slots']))
                {
                    foreach ($validatedData['slots'] as $slotData)
                    {
                        $schedule->slots()
                            ->where('day_in_cycle', $slotData['day_in_cycle'])
                            ->update(['work_pattern_id' => $slotData['work_pattern_id'] ?? null]);
                    }
                }
            }
            return $schedule;
        });
        return new ShiftScheduleResource($schedule->load('slots'));
    }

    /**
     * Display the specified resource.
     */
    public function show(ShiftSchedule $shiftSchedule)
    {
        return new ShiftScheduleResource($shiftSchedule->loadMissing('slots.workPattern'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ShiftSchedule $shiftSchedule)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255', Rule::unique('shift_schedules')->ignore($shiftSchedule->id)],
            // تغییر طول چرخه فعلا پشتیبانی نمی‌شود (پیچیده است)
            'cycle_length_days' => 'sometimes|integer|min:1|max:31', // اگر ارسال شد باید معتبر باشد
            'cycle_start_date' => 'required|date_format:Y-m-d',
        ]);
        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        // --- cycle_length_days ---
        if (isset($validatedData['cycle_length_days']) && $validatedData['cycle_length_days'] != $shiftSchedule->cycle_length_days) {
            // TODO: منطق پیچیده‌ای نیاز است:
             return response()->json(['message' => 'Changing cycle length is not currently supported via API update.'], 400);
        }
        // -----------------------------------------

        $shiftSchedule->update($validatedData);

        return new ShiftScheduleResource($shiftSchedule->load('slots'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ShiftSchedule $shiftSchedule)
    {
        if ($shiftSchedule->workGroups()->exists() || $shiftSchedule->employees()->exists())
        {
             return response()->json(['message' => 'Cannot delete shift schedule because it is assigned to work groups or employees.'], 409);
        }
        try {
            $shiftSchedule->slots()->delete();
        }
        catch (\Exception $exception)
        {

        }
        $shiftSchedule->delete();
        return response()->json(null, 204);
    }
}
