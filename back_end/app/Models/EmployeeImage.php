<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeImage extends Model
{
    protected $table = 'employee_images';
    protected $fillable = [
        'employee_id',
        'original_name',
        'webp_path',
        'original_path',
        'mime_type',
        'size',

    ];

    public function user() : BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
