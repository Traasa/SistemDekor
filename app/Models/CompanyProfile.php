<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'about',
        'description',
        'services',
        'gallery',
        'phone',
        'email',
        'address',
        'website',
        'social_media',
        'logo',
        'favicon',
        'hero_image',
        'hero_side_image',
        'about_gallery_images',
        'portfolio_highlight_images',
    ];

    protected $casts = [
        'services' => 'array',
        'gallery' => 'array',
        'social_media' => 'array',
        'about_gallery_images' => 'array',
        'portfolio_highlight_images' => 'array',
    ];
}
