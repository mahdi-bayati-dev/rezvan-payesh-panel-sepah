<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (!$this->resource) {
            return [];
        }

        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),

            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'personnel_code' => $this->personnel_code,
            'position' => $this->position,
            'starting_job' => $this->starting_job,

            'organization' => new OrganizationResource($this->whenLoaded('organization')),
            'work_group' => new WorkGroupResource($this->whenLoaded('workGroup')),
            'week_pattern' => new WeekPatternResource($this->whenLoaded('weekPattern')),
            'shift_schedule' => new ShiftScheduleResource($this->whenLoaded('shiftSchedule')),

            'father_name' => $this->father_name,
            'birth_date' => $this->birth_date,
            'nationality_code' => $this->nationality_code,
            'gender' => $this->gender,
            'is_married' => $this->is_married,
            'education_level' => $this->education_level,
            'phone_number' => $this->phone_number,
            'house_number' => $this->house_number,
            'sos_number' => $this->sos_number,
            'address' => $this->address,
        ];
    }
}
