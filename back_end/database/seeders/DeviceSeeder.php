<?php

namespace Database\Seeders;

use App\Models\Device;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Device::firstOrCreate(
            ['name' => 'سرویس AI شهرداری یک'],
            [
                'registration_area' => 'شهرداری یک',
                'type' => 'ai_service',
                'status' => 'offline',
            ]
        );
    }
}
