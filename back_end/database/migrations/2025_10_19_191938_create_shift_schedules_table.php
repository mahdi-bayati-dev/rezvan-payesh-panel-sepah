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
        Schema::create('shift_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique()->comment('نام برنامه کاری، مثلا: چرخش سه شیفت');
            $table->unsignedInteger('cycle_length_days')->comment('طول چرخه به روز، مثلا: 4 برای صبح-ظهر-شب-استراحت');
            $table->date('cycle_start_date')->nullable()->comment('تاریخ مبنا برای شروع محاسبه چرخه');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_schedules');
    }
};
