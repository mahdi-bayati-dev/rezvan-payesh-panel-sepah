<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HolidayCollection;
use App\Http\Resources\HolidayResource;
use App\Models\Holiday;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Middleware\RoleMiddleware;

class HolidayController extends Controller
{
    public function __construct()
    {
        $this->middleware('role:super_admin')->except('index');
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->query(), [
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date' => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $startDate = $request->query('start_date') ? Carbon::parse($request->query('start_date')) : null;
        $endDate = $request->query('end_date') ? Carbon::parse($request->query('end_date')) : null;

        $holidays = Holiday::query()
            ->when($startDate, function ($query, $start) {
                $query->where('date', '>=', $start);
            })
            ->when($endDate, function ($query, $end) {
                $query->where('date', '<=', $end);
            })
            ->orderBy('date')
            ->paginate(15);

        return new HolidayCollection($holidays);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date_format:Y-m-d|unique:holidays,date', // تاریخ باید یکتا باشد
            'name' => 'nullable|string|max:255',
            'is_official' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        $holiday = Holiday::create($validatedData);

        return (new HolidayResource($holiday))
                ->response()
                ->setStatusCode(201);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $date)
    {
        $validator = Validator::make(['date' => $date], [
            'date' => 'required|date_format:Y-m-d',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid date format. Use YYYY-MM-DD.'], 400); // Bad Request
        }

        // پیدا کردن و حذف رکورد بر اساس تاریخ
        $deleted = Holiday::where('date', $date)->delete();

        if ($deleted) {
            return response()->json(null, 204); // No Content - موفقیت‌آمیز
        } else {
            return response()->json(['message' => 'Holiday not found for the specified date.'], 404); // Not Found
        }
    }
}
