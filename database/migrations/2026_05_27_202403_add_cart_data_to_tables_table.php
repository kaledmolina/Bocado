<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function transition()
    {
        // Dummy method
    }

    public function up(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            $table->json('cart_data')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            $table->dropColumn('cart_data');
        });
    }
};
