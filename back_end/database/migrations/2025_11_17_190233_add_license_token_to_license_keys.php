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
        Schema::table('license_keys', function (Blueprint $table) {
            $table->text('license_token')->nullable()->comment('کل توکن لایسنس که توسط توسعه‌دهنده امضا شده');
            $table->integer('user_limit')->default(0);
            $table->enum('status',["trial",'license_expired','licensed','trial_expired','tampered'])->default('trial');
            $table->timestamp('expires_at')->nullable()->comment('تاریخ انقضای استخراج شده از توکن');
            $table->uuid('installation_id')->unique();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('license_keys', function (Blueprint $table) {
            $table->dropColumn('license_token', 'installation_id', 'status', 'expires_at', 'user_limit');
        });
    }
};
