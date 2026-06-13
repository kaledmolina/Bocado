<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->boolean('security_waiter_activation')->default(false)->after('is_active');
            $table->boolean('security_table_pin')->default(false)->after('security_waiter_activation');
        });

        Schema::table('tables', function (Blueprint $table) {
            $table->boolean('is_active_for_order')->default(false)->after('status');
            $table->string('temp_pin', 4)->nullable()->after('is_active_for_order');
        });
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn(['security_waiter_activation', 'security_table_pin']);
        });

        Schema::table('tables', function (Blueprint $table) {
            $table->dropColumn(['is_active_for_order', 'temp_pin']);
        });
    }
};
