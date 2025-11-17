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
        Schema::table('shift_schedules', function (Blueprint $table) {
            $table->boolean('ignore_holidays')
                  ->default(false)
                  ->after('cycle_start_date')
                  ->comment('آیا این برنامه شیفتی باید همه تعطیلات (رسمی و جمعه) را نادیده بگیرد؟');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shift_schedules', function (Blueprint $table) {
            $table->dropColumn('ignore_holidays');
        });
    }
};
