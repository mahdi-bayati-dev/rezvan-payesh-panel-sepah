<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Carbon;


class TimeController extends Controller
{
    public function index()
    {
        $now = Carbon::now();

        return response()->json([
            "iso_time" => $now->toIso8601String(),

            "display_time" => $now->toDateTimeString(),

            "timestamp" => $now->timestamp,

            "timezone" => config('app.timezone'),
        ]);
    }
}