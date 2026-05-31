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
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->string('hero_image')->nullable()->after('favicon');
            $table->string('hero_side_image')->nullable()->after('hero_image');
            $table->json('about_gallery_images')->nullable()->after('hero_side_image');
            $table->json('portfolio_highlight_images')->nullable()->after('about_gallery_images');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'hero_image',
                'hero_side_image',
                'about_gallery_images',
                'portfolio_highlight_images',
            ]);
        });
    }
};
