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
        Schema::create('week_patterns', function (Blueprint $table) {
           $table->id();
            $table->string('name')->unique()->comment('نام برنامه هفتگی، مثلا: برنامه اداری');


            $table->foreignId('saturday_pattern_id')->nullable()
                  ->comment('الگوی روز شنبه')
                  ->constrained('work_patterns')
                  ->onDelete('set null');

            $table->foreignId('sunday_pattern_id')->nullable()
                  ->comment('الگوی روز یکشنبه')
                  ->constrained('work_patterns')
                  ->onDelete('set null');

            $table->foreignId('monday_pattern_id')->nullable()
                  ->comment('الگوی روز دوشنبه')
                  ->constrained('work_patterns')
                  ->onDelete('set null');

            $table->foreignId('tuesday_pattern_id')->nullable()
                  ->comment('الگوی روز سه شنبه')
                  ->constrained('work_patterns')
                  ->onDelete('set null');

            $table->foreignId('wednesday_pattern_id')->nullable()
                  ->comment('الگوی روز چهارشنبه')
                  ->constrained('work_patterns')
                  ->onDelete('set null');

            $table->foreignId('thursday_pattern_id')->nullable()
                  ->comment('الگوی روز پنجشنبه')
                  ->constrained('work_patterns')
                  ->onDelete('set null');

            $table->foreignId('friday_pattern_id')->nullable()
                  ->comment('الگوی روز جمعه')
                  ->constrained('work_patterns')
                  ->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('week_patterns');
    }
};
