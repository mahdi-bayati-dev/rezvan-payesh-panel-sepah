<?php

use App\Models\WorkPattern;
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
        Schema::create('work_patterns', function (Blueprint $table) {
            $table->id();
            $table->string("name");
            $table->enum("type", ['fixed','floating'])->default('fixed');
            $table->string("start_time")->nullable();
            $table->string("end_time")->nullable();
            $table->string('work_duration_minutes')->default(480);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_patterns');
    }
};
