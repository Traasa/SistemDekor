<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    protected $fillable = [
        'title',
        'description',
        'image_url',
        'category',
        'is_featured',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
    ];

    /**
     * Scope for featured portfolios
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
