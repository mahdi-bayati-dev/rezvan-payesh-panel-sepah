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
        Schema::table('week_patterns', function (Blueprint $table) {
            $table->string('floating_start', 50)->after('name')->default(20);
            $table->string('floating_end', 50)->after('floating_start')->default(15);
        });

        Schema::table('shift_schedules', function (Blueprint $table) {
            $table->string('floating_start', 50)->after('event_type')->default(20);
            $table->string('floating_end', 50)->after('floating_start')->default(15);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('week_patterns', function (Blueprint $table) {
            $table->dropColumn('floating_start', 'floating_end');
        });
        Schema::table('shift_schedules', function (Blueprint $table) {
            $table->dropColumn('floating_start', 'floating_end');
        });
    }
};
