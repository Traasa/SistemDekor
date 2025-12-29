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
    ];

    protected $casts = [
        'services' => 'array',
        'gallery' => 'array',
        'social_media' => 'array'
    ];
}
