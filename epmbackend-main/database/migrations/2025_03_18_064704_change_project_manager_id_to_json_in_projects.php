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
        Schema::table('projects', function (Blueprint $table) {
            // Drop the existing column and create a new one with JSON type.
            $table->dropColumn('project_manager_id');
        });

        // Add the column again with the JSON type
        Schema::table('projects', function (Blueprint $table) {
            $table->json('project_manager_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Drop the column with JSON type and recreate it as bigInteger.
            $table->dropColumn('project_manager_id');
        });

        // Add the column again with the BIGINT type.
        Schema::table('projects', function (Blueprint $table) {
            $table->bigInteger('project_manager_id')->unsigned()->nullable();
        });
    }
};
