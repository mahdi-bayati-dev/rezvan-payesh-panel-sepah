<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
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
            'status' => $this->status,

            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'duration_for_humans' => $this->whenNotNull($this->duration_for_humans),


            'reason' => $this->reason,
            'rejection_reason' => $this->rejection_reason,


            'processed_at' => $this->processed_at,


            /**
             * اطلاعات کارمندی که درخواست را ثبت کرده.
             * (فقط زمانی لود می‌شود که در کنترلر از ->with('employee') استفاده کنید)
             */
            'employee' => new EmployeeResource($this->whenLoaded('employee')),

            /**
             * اطلاعات نوع مرخصی (ساعتی، روزانه، استعلاجی و ...)
             */
            'leave_type' => new LeaveTypeResource($this->whenLoaded('leaveType')),

            /**
             * اطلاعات مدیری که درخواست را پردازش کرده (تایید یا رد کرده)
             */
            'processor' => new UserResource($this->whenLoaded('processor')),


            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
