<?php

use App\Models\Employee;
use App\Models\LeaveRequest;
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
        Schema::create('daily_attendance_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Employee::class)->constrained()->cascadeOnDelete();
            $table->date('date');

            $table->enum('status',['present','absent','off_day',"on_leave","holiday",'present_with_leave'])->default('present');

            $table->time('expected_start_time')->nullable();
            $table->time('expected_end_time')->nullable();

            $table->dateTime('actual_check_in')->nullable();
            $table->dateTime('actual_check_out')->nullable();

            $table->integer('lateness_minutes')->nullable();
            $table->integer('early_departure_minutes')->nullable();
            $table->integer('work_duration_minutes')->nullable();


            $table->foreignIdFor(LeaveRequest::class)->nullable()->constrained()->nullOnDelete();

            $table->string('source_schedule_type')->nullable();
            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->unique(['employee_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_attendance_summaries');
    }
};
