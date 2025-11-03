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
        Schema::create('employee_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employees_id')->constrained('employees')->onDelete('cascade');
            // تاریخ روزی که این شیفت به آن تعلق دارد
            $table->date('date');

            // اتصال به شیفت (WorkPattern) اختصاص داده شده برای این روز
            // می‌تواند null باشد اگر روز استراحت، تعطیل یا مرخصی باشد
            $table->foreignId('work_pattern_id')->nullable()->constrained('work_patterns')->onDelete('set null');

            $table->boolean('is_off_day')->default(false)->comment('آیا این روز استراحت برنامه‌ریزی شده است؟');

            $table->foreignId('shift_schedule_id')->nullable()->constrained('shift_schedules')->onDelete('set null');

            $table->enum('source', ['scheduled', 'manual', 'leave', 'holiday'])
                  ->default('scheduled')
                  ->comment('منبع رکورد: برنامه‌ریزی شده، دستی، مرخصی، تعطیل رسمی');



            $table->timestamps();

            $table->unique(['employee_id', 'date']);

            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_shifts');
    }
};
