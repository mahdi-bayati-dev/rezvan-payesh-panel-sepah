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


            'children' => $this->when(
                // چک کن آیا اتریبیوت children روی مدل ست شده؟
                property_exists($this, 'children') || $this->relationLoaded('children'),
                // اگر ست شده، آن را (که خودش یک کالکشن است) به ریسورس بده
                fn () => OrganizationResource::collection($this->children)
            ),
            'descendants' => $this->when(
                // این را هم برای متد index ادمین L2 اصلاح می‌کنیم
                property_exists($this, 'descendants') || $this->relationLoaded('descendants'),
                fn () => OrganizationResource::collection($this->descendants)
            ),
        ];
    }
}
