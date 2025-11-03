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



            'parent' => new LeaveTypeResource($this->whenLoaded('parent')),


            'children' => LeaveTypeResource::collection($this->whenLoaded('children')),


            'leave_requests_count' => $this->whenCounted('leaveRequests'), // تعداد درخواست‌ها
            'leave_requests' => LeaveRequestResource::collection($this->whenLoaded('leaveRequests')), // لیست کامل درخواست‌ها


            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
