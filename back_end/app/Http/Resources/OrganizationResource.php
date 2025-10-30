<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
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
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,


            'employees_count' => $this->whenCounted('employees'),


            'employees' => EmployeeResource::collection($this->whenLoaded('employees')),


            'children' => OrganizationResource::collection($this->whenLoaded('children')),
            'descendants' => OrganizationResource::collection($this->whenLoaded('descendants')),
        ];
    }
}
