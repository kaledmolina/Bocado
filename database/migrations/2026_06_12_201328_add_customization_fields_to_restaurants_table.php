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
        Schema::table('restaurants', function (Blueprint $table) {
            $table->string('primary_color')->default('#f97316');
            $table->string('secondary_color')->default('#1e293b');
            $table->string('welcome_subtitle')->default('¡Pide desde tu mesa de forma rápida!');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn(['primary_color', 'secondary_color', 'welcome_subtitle']);
        });
    }
};
