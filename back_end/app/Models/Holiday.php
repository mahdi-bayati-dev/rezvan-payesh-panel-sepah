<?php

namespace App\Models;

use GeneaLabs\LaravelModelCaching\Traits\Cachable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Holiday extends Model implements Auditable
{
    use AuditableTrait, HasFactory,Cachable;


    protected $fillable = [
        'date',
        'name',
        'is_official',
    ];

    protected $casts = [
        'date' => 'date',
        'is_official' => 'boolean',
    ];
}
