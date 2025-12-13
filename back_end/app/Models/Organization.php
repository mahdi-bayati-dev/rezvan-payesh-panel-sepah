<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Staudenmeir\LaravelAdjacencyList\Eloquent\HasRecursiveRelationships;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Organization extends Model implements Auditable
{
    use AuditableTrait, HasFactory,HasRecursiveRelationships;
    protected $fillable =
        [
            'name', 'parent_id'
        ];

    /**
     * هر سازمان می‌تواند کارمندان متعددی داشته باشد.
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'parent_id')->withDefault();
    }
}
