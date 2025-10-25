<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleSlotResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
       return [
            'id' => $this->id,
            'shift_schedule_id' => $this->shift_schedule_id,
            'day_in_cycle' => $this->day_in_cycle,
            'work_pattern_id' => $this->work_pattern_id,
            'work_pattern_name' => $this->whenLoaded('workPattern', fn() => $this->workPattern?->name),
            'override_start_time' => $this->override_start_time?->format('H:i'),
            'override_end_time'   => $this->override_end_time?->format('H:i'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
