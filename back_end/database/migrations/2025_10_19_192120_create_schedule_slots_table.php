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
        Schema::create('schedule_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shift_schedule_id')->constrained('shift_schedules')->onDelete('cascade');
            $table->unsignedInteger('day_in_cycle')->comment('شماره روز در چرخه (از 1 تا cycle_length_days)');
            $table->foreignId('work_pattern_id')->nullable()->constrained('work_patterns')->onDelete('set null');

            $table->time('override_start_time')->nullable();
            $table->time('override_end_time')->nullable();
            $table->boolean('is_off_day')->virtualAs('work_pattern_id IS NULL')->index();
            $table->timestamps();

            $table->unique(['shift_schedule_id', 'day_in_cycle']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_slots');
    }
};
