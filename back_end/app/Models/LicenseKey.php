<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LicenseKey extends Model
{
    protected $fillable = [
        'installation_id',
        'status',
        'expires_at',
        'user_limit',
        'license_token',
        'trial_payload_db'

    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'user_limit' => 'integer',
    ];
}
