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
        Schema::create('work_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');

            // اتصال به الگوی کاری (شیفت پیش‌فرض، اگر برنامه کاری نداشت)
            $table->foreignId("week_pattern_id")
                ->nullable()
                ->constrained("week_patterns")
                ->onDelete('set null')
                ->onUpdate('cascade');


            // <-- جدید: اتصال به برنامه کاری -->
            $table->foreignId('shift_schedule_id')
                  ->nullable()
                  ->constrained('shift_schedules')
                  ->onDelete('set null')
                  ->comment('برنامه کاری پیش‌فرض برای این گروه');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_groups');
    }
};
