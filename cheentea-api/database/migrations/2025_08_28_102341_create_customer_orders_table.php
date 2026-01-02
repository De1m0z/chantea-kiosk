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
        Schema::create('customer_orders', function (Blueprint $table) {
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->decimal('total_spent', 10, 2)->default(0);
            $table->date('last_order_date')->nullable();
            $table->integer('lifetime_orders')->default(0);
            $table->primary(['customer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_orders');
    }
};
