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
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')
                  ->constrained('employees')
                  ->onDelete('cascade');

            $table->foreignId("device_id")
                ->nullable()
                ->constrained("devices")
                ->onDelete('set null')
                ->onUpdate('cascade');

            $table->string('source_name')->nullable();

            $table->enum('source_type', ['auto', 'manual','manual_edit'])->default('auto');

            $table->foreignId('edited_by_user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            $table->text('remarks')->nullable();
            $table->boolean("is_allowed")->default(false);

            $table->datetime('timestamp');



            $table->enum('event_type', ['check_in', 'check_out']);


            $table->timestamps();

            $table->index(['employee_id', 'timestamp']);
            $table->unique(['employee_id', 'timestamp']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_logs');
    }
};
