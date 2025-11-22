<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeImage extends Model
{
    protected $table = 'employees_images';
    protected $fillable = [
        'employee_id',
        'original_name',
        'path',
        'mime_type',
        'size',

    ];

    public function user() : BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
