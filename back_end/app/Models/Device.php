<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'registration_area',
        'type',
        'status',
        'last_heartbeat_at',
        'last_known_ip',
    ];

    protected $hidden = [
        'api_key',
    ];

    protected $casts = [
        'type' => 'string',
        'status' => 'string',
        'last_heartbeat_at' => 'datetime',
    ];


    protected static function boot()
    {
        parent::boot();
        static::creating(function ($device) {
            if (empty($device->api_key)) {
                $device->api_key = Str::random(64);
            }
        });
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }
}
