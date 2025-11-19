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
        Schema::create('license_keys', function (Blueprint $table) {
            $table->id();

            $table->uuid('installation_id')->unique();

            $table->enum('status',["trial",'license_expired','licensed','trial_expired','tampered'])->default('trial');

            $table->text('trial_payload_db')->nullable();

            $table->text('license_token')->nullable();

            $table->timestamp('expires_at')->nullable();

            $table->integer('user_limit')->default(99999);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('license_keys');
    }
};
