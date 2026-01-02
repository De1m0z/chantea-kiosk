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
        Schema::table('orders', function (Blueprint $table) {
            // Store pending stamps to award when order is completed
            $table->integer('pending_stamps')->default(0)->after('status');
            // Store the loyalty customer ID to award stamps to (nullable for non-loyalty orders)
            $table->unsignedBigInteger('loyalty_customer_id')->nullable()->after('pending_stamps');
            // Track if stamps have been awarded for this order
            $table->boolean('stamps_awarded')->default(false)->after('loyalty_customer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['pending_stamps', 'loyalty_customer_id', 'stamps_awarded']);
        });
    }
};
