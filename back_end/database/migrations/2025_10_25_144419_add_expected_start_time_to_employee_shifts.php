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
        Schema::table('employee_shifts', function (Blueprint $table) {
            $table->time('expected_start_time')->nullable()->after('is_off_day')->comment('زمان شروع مورد انتظار شیفت (با در نظر گرفتن override)');
            $table->time('expected_end_time')->nullable()->after('expected_start_time')->comment('زمان پایان مورد انتظار شیفت (با در نظر گرفتن override)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_shifts', function (Blueprint $table) {
            $table->dropColumn(['expected_start_time', 'expected_end_time']);
        });
    }
};
