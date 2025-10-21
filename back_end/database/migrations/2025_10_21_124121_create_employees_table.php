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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('set null');
            $table->string("last_name");
            $table->string('first_name');
            $table->string("phone_number")->unique()->index();
            $table->string("house_number");
            $table->string("sos_number");
            $table->boolean("is_married")->default(false);
            $table->text("address");
            $table->string("father_name");
            $table->date("birth_date");
            $table->string("position");
            $table->enum("gender", ['male', 'female']);
            $table->foreignId("organization_id")->nullable()
                ->constrained("organizations")
                ->onDelete('set null');
            $table->string("nationality_code")->unique()->index();
            $table->enum('education_level', ['diploma','advanced_diploma', 'bachelor', 'master','doctorate','post_doctorate']);
            $table->date("starting_job");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
