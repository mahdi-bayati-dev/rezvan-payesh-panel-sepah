<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShiftScheduleCollection;
use App\Http\Resources\ShiftScheduleResource;
use App\Models\ScheduleSlot;
use App\Models\ShiftSchedule;
use App\Services\WorkPatternService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Carbon;

class ShiftScheduleController extends Controller
{
    public function __construct(protected WorkPatternService $workPatternService)
    {
        $this->authorizeResource(ShiftSchedule::class, 'shiftSchedule');
    }

    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 20);
        if ($perPage > 100) {
            $perPage = 100;
        }
        $schedules = ShiftSchedule::orderBy('name')->paginate($perPage);
        return new ShiftScheduleCollection($schedules);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:shift_schedules,name',
            'cycle_length_days' => 'required|integer|min:1|max:31',
            'cycle_start_date' => 'required|date_format:Y-m-d',
            'ignore_holidays' => 'required|boolean',

            'slots' => 'required|array',
            'slots.*.day_in_cycle' => 'required|integer|distinct|min:1',
            'slots.*.is_off' => 'required|boolean',

            'slots.*.name' => 'nullable|string|max:255|required_if:slots.*.is_off,false',
            'slots.*.start_time' => 'nullable|date_format:H:i|required_if:slots.*.is_off,false',
            'slots.*.end_time' => [
                'nullable',
                'date_format:H:i',
                'required_if:slots.*.is_off,false',
                function ($attribute, $value, $fail) use ($request) {
                    $index = explode('.', $attribute)[1];
                    $startTime = $request->input("slots.{$index}.start_time");
                    $isOff = $request->input("slots.{$index}.is_off");

                    if (!$isOff && $startTime && $value) {
                        if ($startTime === $value) {
                            $fail('زمان شروع و پایان شیفت نمی‌تواند یکسان باشد.');
                        }

                    }
                },
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        try {
            $schedule = DB::transaction(function () use ($validatedData) {
                $schedule = ShiftSchedule::create([
                    'name' => $validatedData['name'],
                    'cycle_length_days' => $validatedData['cycle_length_days'],
                    'cycle_start_date' => $validatedData['cycle_start_date'],
                    'ignore_holidays' => $validatedData['ignore_holidays'],
                ]);

                $slotsMap = [];
                foreach ($validatedData['slots'] as $slotData) {
                    $slotsMap[$slotData['day_in_cycle']] = $slotData;
                }

                $slotsToCreate = [];
                for ($day = 1; $day <= $schedule->cycle_length_days; $day++) {
                    $work_pattern_id = null;

                    if (isset($slotsMap[$day])) {
                        $slotData = $slotsMap[$day];

                        if (isset($slotData['is_off']) && $slotData['is_off'] === false) {

                            $start = Carbon::createFromFormat('H:i', $slotData['start_time']);
                            $end = Carbon::createFromFormat('H:i', $slotData['end_time']);

                            if ($end->lt($start)) {
                                $end->addDay();
                            }

                            $workDurationMinutes = $end->diffInMinutes($start);

                            $workPattern = $this->workPatternService->findOrCreatePattern([
                                'name' => $slotData['name'],
                                'start_time' => $slotData['start_time'],
                                'end_time' => $slotData['end_time'],
                                'type' => 'fixed',
                                'work_duration_minutes' => abs($workDurationMinutes), // ارسال مقدار محاسبه شده
                            ]);

                            $work_pattern_id = $workPattern->id;
                        }
                    }

                    $slotsToCreate[] = [
                        'shift_schedule_id' => $schedule->id,
                        'day_in_cycle' => $day,
                        'work_pattern_id' => $work_pattern_id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                ScheduleSlot::insert($slotsToCreate);
                return $schedule;
            });

            return new ShiftScheduleResource($schedule->load('slots.workPattern'));

        } catch (\Exception $e) {
            Log::error("Error creating shift schedule: " . $e->getMessage());
            return response()->json(['message' => 'خطا در ایجاد برنامه شیفتی.', 'details' => $e->getMessage()], 500);
        }
    }

    public function show(ShiftSchedule $shiftSchedule)
    {
        return new ShiftScheduleResource($shiftSchedule->loadMissing('slots.workPattern'));
    }

    public function update(Request $request, ShiftSchedule $shiftSchedule)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255', Rule::unique('shift_schedules')->ignore($shiftSchedule->id)],
            'cycle_length_days' => 'sometimes|integer|min:1|max:31',
            'cycle_start_date' => 'required|date_format:Y-m-d',
            'ignore_holidays' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        if (isset($validatedData['cycle_length_days']) && $validatedData['cycle_length_days'] != $shiftSchedule->cycle_length_days) {
             return response()->json(['message' => 'Changing cycle length is not currently supported via API update.'], 400);
        }

        $shiftSchedule->update($validatedData);

        return new ShiftScheduleResource($shiftSchedule->load('slots'));
    }

    public function destroy(ShiftSchedule $shiftSchedule)
    {
        if ($shiftSchedule->workGroups()->exists() || $shiftSchedule->employees()->exists()) {
             return response()->json(['message' => 'Cannot delete shift schedule because it is assigned to work groups or employees.'], 409);
        }

        try {
            DB::transaction(function() use ($shiftSchedule) {
                $shiftSchedule->slots()->delete();
                $shiftSchedule->delete();
            });
        } catch (\Exception $exception) {
            Log::error($exception->getMessage());
            return response()->json(['message' => 'Failed to delete schedule'], 500);
        }

        return response()->json(null, 204);
    }
}