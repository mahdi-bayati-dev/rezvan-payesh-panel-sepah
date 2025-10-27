<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Staudenmeir\LaravelAdjacencyList\Eloquent\HasRecursiveRelationships;

class Organization extends Model
{
    use HasFactory,HasRecursiveRelationships;
    protected $fillable =
        [
            'name', 'parent_id'
        ];

    /**
     * هر سازمان می‌تواند کارمندان متعددی داشته باشد.
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employees::class);
    }
}
