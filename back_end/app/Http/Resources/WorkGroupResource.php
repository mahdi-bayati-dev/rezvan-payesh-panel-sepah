<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkGroupResource extends JsonResource
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
            'name' => $this->name,
            'work_pattern_id' => $this->work_pattern_id,
            'work_pattern_name' => $this->whenLoaded('workPattern', fn() => $this->workPattern?->name),
            'shift_schedule_id' => $this->shift_schedule_id,
            'shift_schedule_name' => $this->whenLoaded('shiftSchedule', fn() => $this->shiftSchedule?->name),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
