<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->unsignedBigInteger('destination_id')->nullable()->after('postal_code');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('destination_id')->nullable()->after('shipping_postal_code');
            $table->string('courier_code', 20)->nullable()->after('courier_service');
            $table->string('komship_order_no', 60)->nullable()->after('transaction_id');
            $table->string('airway_bill', 100)->nullable()->after('komship_order_no');
        });
    }

    public function down(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->dropColumn('destination_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['destination_id', 'courier_code', 'komship_order_no', 'airway_bill']);
        });
    }
};
