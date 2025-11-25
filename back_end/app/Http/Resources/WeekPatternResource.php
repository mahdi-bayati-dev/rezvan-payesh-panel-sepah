<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WeekPatternResource extends JsonResource
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'saturday_pattern' => new WorkPatternResource($this->whenLoaded('saturdayPattern')),
            'sunday_pattern' => new WorkPatternResource($this->whenLoaded('sundayPattern')),
            'monday_pattern' => new WorkPatternResource($this->whenLoaded('mondayPattern')),
            'tuesday_pattern' => new WorkPatternResource($this->whenLoaded('tuesdayPattern')),
            'wednesday_pattern' => new WorkPatternResource($this->whenLoaded('wednesdayPattern')),
            'thursday_pattern' => new WorkPatternResource($this->whenLoaded('thursdayPattern')),
            'friday_pattern' => new WorkPatternResource($this->whenLoaded('fridayPattern')),
            'floating_start' => $this->floating_start,
            "floating_end" => $this->floating_end,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
