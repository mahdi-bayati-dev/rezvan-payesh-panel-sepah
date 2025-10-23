<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->string("name");
            $table->string("registration_area");
            $table->enum('type', ['ai_service', 'camera', 'manual_kiosk'])->default('ai_service');
            $table->string('api_key', 64)->unique();
            $table->enum('status', ['online', 'offline', 'maintenance'])->default('offline');
            $table->timestamp('last_heartbeat_at')->nullable()->comment('زمان آخرین درخواست دریافتی');
            $table->ipAddress('last_known_ip')->nullable()->comment('آخرین IP که دستگاه از آن متصل شده');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
