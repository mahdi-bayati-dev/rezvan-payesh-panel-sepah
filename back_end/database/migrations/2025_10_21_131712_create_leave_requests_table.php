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
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')
                ->constrained('employees')
                ->onDelete('cascade');

            $table->foreignId('leave_type_id')
                ->constrained('leave_types')
                ->onDelete('restrict');


            $table->dateTime('start_time');

            $table->dateTime('end_time');

            $table->enum('status', ['pending', 'approved', 'rejected'])
                ->default('pending')
                ->index();

            $table->foreignId('processed_by_user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            $table->timestamp('processed_at')->nullable();

            $table->text('reason')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
