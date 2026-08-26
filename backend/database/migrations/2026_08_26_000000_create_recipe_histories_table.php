<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipe_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('dish', 255);
            $table->unsignedInteger('total_items')->default(0);
            $table->json('available_items')->nullable();
            $table->json('unavailable_items')->nullable();
            $table->json('additional_items')->nullable();
            $table->json('recipe')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipe_histories');
    }
};
