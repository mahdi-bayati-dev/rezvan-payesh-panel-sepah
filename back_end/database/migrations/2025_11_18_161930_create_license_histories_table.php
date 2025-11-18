<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('license_histories', function (Blueprint $table) {
            $table->id();
            $table->string('token_id')->unique();

            $table->foreignId('license_key_id')->constrained('license_keys')->onDelete('cascade');

            $table->timestamp('activated_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('license_histories');
    }

};