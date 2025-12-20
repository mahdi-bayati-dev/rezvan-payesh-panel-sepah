<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceLogResource extends JsonResource
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

            'employee_id' => $this->employee_id,
            'event_type' => $this->event_type,
            'timestamp' => $this->timestamp?->toDateTimeString()    ,
            'source_name' => $this->source_name,
            'source_type' => $this->source_type,
            'lateness_minutes' => $this->lateness_minutes,
            'early_departure_minutes' => $this->early_departure_minutes,
            'is_allowed' => $this->is_allowed,
            'remarks' => $this->remarks,
            'device_id' => $this->device_id,
            'edited_by_user_id' => $this->edited_by_user_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'employee' => new EmployeeResource($this->whenLoaded('employee')),
            'editor' => new UserResource($this->whenLoaded('editor')),
        ];
    }
}
