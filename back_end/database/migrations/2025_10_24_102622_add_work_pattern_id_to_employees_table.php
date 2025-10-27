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
        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('week_pattern_id')
                  ->nullable()
                  ->after('shift_offset')
                  ->comment('الگوی کاری اختصاصی برای نادیده گرفتن برنامه شیفتی')
                  ->constrained('week_pattern')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['work_pattern_id']);
            $table->dropColumn('work_pattern_id');
        });
    }
};
