<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveTypeResource extends JsonResource
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
            'parent_id' => $this->parent_id,
            'description'=> $this->description,

            'parent' => new LeaveTypeResource($this->whenLoaded('parent')),


            'children' => LeaveTypeResource::collection($this->whenLoaded('allChildren')),

        ];
    }
}
