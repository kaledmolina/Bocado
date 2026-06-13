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
        // 1. Add is_hiring column to restaurants
        Schema::table('restaurants', function (Blueprint $table) {
            $table->boolean('is_hiring')->default(false)->after('name');
        });

        // 2. Create shifts table
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
        });

        // 3. Create waiter_ratings table
        Schema::create('waiter_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('waiter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->integer('rating'); // 1 to 5 stars
            $table->text('comment')->nullable();
            $table->timestamps();
        });

        // 4. Create restaurant_applications table
        Schema::create('restaurant_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('pending'); // 'pending', 'approved', 'rejected'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurant_applications');
        Schema::dropIfExists('waiter_ratings');
        Schema::dropIfExists('shifts');

        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn('is_hiring');
        });
    }
};
